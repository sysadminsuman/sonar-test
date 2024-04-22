//import jwt from "jsonwebtoken";
import i18n from "i18n";
import {
  getRandomNumbers,
  getCurrentUTCTime,
  getCurrentDateTime,
  convertDateToMillisecond,
  getDateDifferenceString,
  compareAppVersions,
  //verifyTokenByclient,
} from "../../helpers/index.js";
import {
  conversationService,
  coversationRecipientService,
  chatMembersService,
  chatService,
  userSocketsService,
  userService,
  pushNotificationService,
} from "../index.js";
import { StatusError, envs } from "../../config/index.js";
import { GROUP_INFOS, NOTIFICATION_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";

export const socketIO = (io) => {
  io.use(async function (socket, next) {
    try {
      // Getting token in query and authenticate
      if (socket.handshake.query && socket.handshake.query.token) {
        // verify token and expiry
        //const decoded = jwt.verify(socket.handshake.query.token, envs.jwt.accessToken.secret);
        //const decodedData = await verifyTokenByclient(socket.handshake.query.token);
        const decoded = JSON.parse(
          Buffer.from(socket.handshake.query.token.split(".")[1], "base64").toString(),
        );
        /*if (!decodedData) {
          let err = new Error("Authentication error");
          err.data = { type: "authentication_error" };
          next(err);
        }*/
        // get user details by email and attack details
        const userDetails = await userService.getByCustomerID(decoded.userNo);
        if (!userDetails) {
          let err = new Error("Authentication error");
          err.data = { type: "authentication_error" };
          next(err);
        }
        socket.userDetails = {
          userId: userDetails.id,
          name: userDetails.name,
          email: userDetails.email,
          profile_image: userDetails.profile_image,
          default_profile_image: userDetails.default_profile_image,
        };
        socket.app_version = socket.handshake.query.app_version
          ? socket.handshake.query.app_version
          : "0";
        next();
      } else {
        let err = new Error("Authentication error");
        err.data = { type: "authentication_error" };
        next(err);
      }
    } catch (e) {
      let err = new Error();
      err.data = { type: "authentication_error" };
      next(err);
    }
  }).on("connection", async (socket) => {
    //console.log("New connection...", socket.id, socket.userDetails);
    const req = socket.request;
    // multilingual initialization
    i18n.init(req);
    // setting korean as default
    req.setLocale("ko");

    try {
      const insertSocketData = {
        user_id: socket.userDetails.userId,
        socket_id: socket.id,
        app_latest_version: socket.app_version,
        create_date: await getCurrentUTCTime(),
      };
      // Insert user current socket in db
      await userSocketsService.createUserSocket(insertSocketData);

      // getting already joined room of user and rejoining while connecting
      const userRooms = await chatMembersService.getUserChatrooms(socket.userDetails.userId);
      for (const room of userRooms) {
        socket.join(room.room_unique_id);
      }

      //console.log("Rejoin group completed....");
    } catch (e) {
      //console.log("[error]", "Connection :", e);
    }

    socket.on("checkConnection", async () => {
      try {
        //console.log("[socket]", "checkConnection", true);

        // sending data current user
        socket.emit("connectionResponse", { connection: true });
      } catch (e) {
        //console.log("[error]", "checkConnection :", e);
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        //console.log("[socket]", "sendMessage", data);

        const {
          message,
          room_id,
          message_id,
          room_unique_id,
          parent_message_id,
          content_type,
          attachments,
          reaction_type,
          emoticon_item_id,
          emoticon_image,
          emoticon_image_type,
          url_meta,
        } = data;
        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);

        const insertMessageData = {
          user_id: userDetails.userId,
          room_id,
          content_type: content_type != "" ? content_type : "text",
          parent_id: parent_message_id,
          emoticon_item_id: emoticon_item_id ? emoticon_item_id : 0,
          message,
          url_meta,
          create_date: correntUTC,
        };

        const [roomDetails, conversationId, memberList] = await Promise.all([
          chatService.getByRoomId(room_id),
          content_type != "reaction" && content_type != "notice"
            ? conversationService.createCoversation(insertMessageData)
            : message_id,
          chatMembersService.getGroupMembersList(room_id),
        ]);
        let attachment_arr = [];
        if (content_type == "image" || content_type == "video") {
          for (let i = 0; i < attachments.length; i++) {
            const insertAttachmentData = {
              conversation_id: conversationId,
              file_name: attachments[i],
              mime_type: content_type,
              create_date: correntUTC,
            };
            const conversationAttachId = await conversationService.createCoversationAttachment(
              insertAttachmentData,
            );
            let n = attachments[i].lastIndexOf("/");
            let thumbimg = attachments[i].split("/");
            if (thumbimg[2] == "videos") {
              thumbimg[3] = thumbimg[3].split(".");
              thumbimg[3][1] = "png";
              thumbimg[3] = thumbimg[3].join(".");
            }
            thumbimg = thumbimg.join("/");

            attachment_arr.push({
              id: conversationAttachId,
              file_name: envs.aws.cdnpath + attachments[i],
              file_name_medium:
                envs.aws.cdnpath + thumbimg.substr(0, n + 1) + "medium" + thumbimg.substring(n),
              file_name_small:
                envs.aws.cdnpath + thumbimg.substr(0, n + 1) + "small" + thumbimg.substring(n),
              expired: 0,
            });
          }
        }
        let conversationNoticeId = 0;
        if (content_type == "notice") {
          const insertNoticeMessageData = {
            user_id: userDetails.userId,
            room_id,
            content_type: "info",
            message: "공지 메시지가 등록되었습니다",
            is_notice: "y",
            create_date: correntUTC,
          };
          conversationNoticeId = await conversationService.createCoversation(
            insertNoticeMessageData,
          );

          if (memberList.length > 0) {
            const insertNoticeRecipientsData = [];
            for (const member of memberList) {
              insertNoticeRecipientsData.push([member.id, conversationNoticeId, "y", correntUTC]);
            }
            await coversationRecipientService.createRecipients(insertNoticeRecipientsData);
          }
        }

        const insertRecipientsData = [];
        const notificationUserIds = [];
        const notificationSilentUserIds = [];
        const unreadMsgUserIds = [];
        const updateLastActivityMember = [];

        if (!roomDetails) throw StatusError.badRequest("groupNotExists");
        if (memberList.length === 0) throw StatusError.badRequest("groupMemberNotExists");

        if (content_type != "reaction" && content_type != "notice") {
          for (const member of memberList) {
            if (member.id == userDetails.userId || member.is_online == "y") {
              insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
            } else {
              insertRecipientsData.push([member.id, conversationId, "n", correntUTC]);
              unreadMsgUserIds.push(member.id);
              if (member.is_enable_notification == "y" && member.is_overall_notification == "y") {
                notificationUserIds.push(member.id);
              } else if (
                member.is_enable_notification == "y" &&
                member.is_overall_notification == "n"
              ) {
                notificationSilentUserIds.push(member.id);
              } else if (
                member.is_enable_notification == "n" &&
                member.is_overall_notification == "y"
              ) {
                notificationSilentUserIds.push(member.id);
              } else {
                notificationSilentUserIds.push(member.id);
              }
            }
            if (content_type != "reaction" && content_type != "notice") {
              updateLastActivityMember.push([member.member_id, correntUTC]);
            }
          }
        }
        //const conversationIDS = await chatService.getConversations(message_id);
        const unreadCount = await chatService.getCountAllUnreadMessages(conversationId);
        const responseData = {
          local_conversation_id:
            content_type != "reaction" && content_type != "notice" ? message_id : "",
          conversation_id: content_type == "notice" ? conversationNoticeId : conversationId,
          conversation_recipient_id: conversationId,
          timestamp: correntUTCMilliseconds,
          content_type: content_type != "" ? content_type : "text",
          message: content_type == "notice" ? "공지 메시지가 등록되었습니다" : message,
          url_meta: url_meta ? url_meta : "",
          user_id: userDetails.userId,
          user_name: userDetails.name,
          profile_image: userDetails.profile_image,
          unread_count:
            content_type != "reaction" && content_type != "notice"
              ? unreadMsgUserIds.length
              : unreadCount,
          room_id,
          room_name: roomDetails.group_name,
          room_image_url: envs.aws.cdnpath + roomDetails.group_image,
          show_notice: content_type == "notice" ? true : false,
        };
        let parentResponseData = {};
        let parentUserName = "";
        if (parent_message_id) {
          const parentConversations = await chatService.getConversations(parent_message_id);
          parentResponseData = {
            local_conversation_id: parentConversations.id,
            conversation_id: parentConversations.id,
            conversation_recipient_id: parentConversations.id,
            timestamp: dayjs(parentConversations.create_date).valueOf(),
            content_type: parentConversations.content_type,
            message: parentConversations.message,
            url_meta: parentConversations.url_meta,
            user_id: parentConversations.user_id,
            user_name: parentConversations.name,
            profile_image: parentConversations.profile_image,
            room_id: parentConversations.room_id,
          };
          parentUserName = parentConversations.name;
          if (
            parentConversations.content_type == "image" ||
            parentConversations.content_type == "video"
          ) {
            const parentConversationAttachments = await chatService.getConversationAttachments(
              parentConversations.id,
            );
            Object.assign(parentResponseData, {
              ["attachments"]: JSON.stringify(parentConversationAttachments),
            });
          }
          let parentConversationEmoticons = {};
          if (
            parentConversations.content_type == "emoticon" &&
            parentConversations.emoticon_item_id
          ) {
            parentConversationEmoticons = await chatService.getEmoticonsItemsByID(
              parentConversations.emoticon_item_id,
            );
            Object.assign(parentResponseData, {
              ["emoticons"]: JSON.stringify(parentConversationEmoticons),
            });
          } else {
            Object.assign(parentResponseData, {
              ["emoticons"]: JSON.stringify(parentConversationEmoticons),
            });
          }
        }

        if (content_type == "reaction") {
          const conversationData = await chatService.getConversations(message_id);

          const isExistUserReaction = await chatService.checkUserConversationReactionsExists(
            conversationData.id,
            userDetails.userId,
          );
          if (isExistUserReaction == 0) {
            const insertReactionData = {
              conversation_id: conversationData.id,
              user_id: userDetails.userId,
              reaction: reaction_type,
              create_date: correntUTC,
            };
            await conversationService.createCoversationReaction(insertReactionData);
          } else {
            const isExistUserSameReaction = await chatService.checkUserConversationReactionsExists(
              conversationData.id,
              userDetails.userId,
              reaction_type,
            );
            if (isExistUserSameReaction == 0) {
              const updateReactionData = {
                reaction: reaction_type,
                create_date: correntUTC,
              };
              await conversationService.updateCoversationReaction(
                updateReactionData,
                conversationData.id,
                userDetails.userId,
              );
            } else {
              await conversationService.deleteCoversationReaction(
                conversationData.id,
                userDetails.userId,
                reaction_type,
              );
            }
          }
          const isExistReaction = await chatService.getConversationReactions(conversationData.id);
          const is_reaction = isExistReaction.length > 0 ? "y" : "n";
          const updateMessageData = {
            is_reaction: is_reaction,
          };
          await conversationService.updateCoversation(updateMessageData, conversationData.id);
          if (is_reaction == "y") {
            const conversationReactions = await chatService.getConversationReactions(
              conversationData.id,
            );
            Object.assign(responseData, {
              ["reactions"]: JSON.stringify(conversationReactions),
            });
          }
        }
        let noticeResponseData = {};
        if (content_type == "notice") {
          const conversationData = await chatService.getConversations(message_id);

          const isExistTopMostNotice = await chatService.checkTopMostNoticesExists(room_id);
          if (isExistTopMostNotice) {
            for (const notice of isExistTopMostNotice) {
              const updateDisplayData = {
                is_display_chatroom: "n",
                updated_by: userDetails.userId,
                update_date: correntUTC,
              };
              await conversationService.updateCoversationNotice(updateDisplayData, notice.id);
            }
          }

          const insertNoticeData = {
            conversation_id: conversationData.id,
            room_id: room_id,
            user_id: userDetails.userId,
            is_display_chatroom: "y",
            status: "active",
            create_date: correntUTC,
          };
          const notice_id = await conversationService.createCoversationNotice(insertNoticeData);

          /*const updateMessageData = {
            is_notice: "y",
          };
          await conversationService.updateCoversation(updateMessageData, conversationData.id);*/

          noticeResponseData = {
            notice_id: notice_id,
            local_conversation_id: conversationData.id,
            conversation_id: conversationData.id,
            conversation_recipient_id: conversationData.id,
            timestamp: correntUTCMilliseconds,
            content_type: conversationData.content_type,
            message: conversationData.message,
            url_meta: conversationData.url_meta,
            user_id: userDetails.userId,
            user_name: userDetails.name,
            profile_image: userDetails.profile_image,
            room_id: conversationData.room_id,
            sender_name: conversationData.name,
            added_timestamp: dayjs(conversationData.create_date).valueOf(),
          };
          if (
            conversationData.content_type == "image" ||
            conversationData.content_type == "video"
          ) {
            const noticeConversationAttachments = await chatService.getConversationAttachments(
              conversationData.id,
            );
            Object.assign(noticeResponseData, {
              ["attachments"]: JSON.stringify(noticeConversationAttachments),
            });
          }
          //Object.assign(responseData, { notice_id: notice_id });
          Object.assign(responseData, {
            ["noticeData"]: JSON.stringify(noticeResponseData),
          });
        }

        if (content_type == "image" || content_type == "video") {
          Object.assign(responseData, { ["attachments"]: JSON.stringify(attachment_arr) });
        }
        Object.assign(responseData, { ["parentData"]: JSON.stringify(parentResponseData) });

        let emoticonResponseData = {};
        if (content_type == "emoticon") {
          emoticonResponseData = {
            id: parseInt(emoticon_item_id),
            image: emoticon_image,
            image_type: emoticon_image_type,
          };
          Object.assign(responseData, { emoticons: JSON.stringify(emoticonResponseData) });
        }
        // sending data to all user including sender of particular room
        //io.in(room_unique_id).emit("acknowledgement", responseData);

        if (content_type == "notice") {
          const userSockets = await userSocketsService.getUserSocketsByRoomID(room_id);
          if (userSockets.length > 0) {
            for (const socketData of userSockets) {
              const check_app_version =
                (await compareAppVersions(socketData.app_latest_version, "8.5.0")) < 0;
              if (check_app_version === false) {
                socket.broadcast.to(socketData.socket_id).emit("acknowledgement", responseData);
              }
            }
          }
          socket.emit("acknowledgement", responseData);
        } else {
          console.log(responseData);
          io.in(room_unique_id).emit("acknowledgement", responseData);
        }

        if (content_type != "reaction" && content_type != "notice") {
          await Promise.all([
            coversationRecipientService.createRecipients(insertRecipientsData),
            // Updating last activity time
            chatMembersService.updateMemberLastActivity(updateLastActivityMember),
          ]);

          if (notificationUserIds.length !== 0) {
            // asynchronous push notification send
            let senderData = {};
            let notificationType = "";
            let badgeNumbers = await userService.getUnreadMessageCountByMultipleUser(
              notificationUserIds,
            );
            if (parent_message_id) {
              senderData = { sender: userDetails.name, message, receiver: parentUserName };
              notificationType = NOTIFICATION_TYPES.REPLY;
            } else {
              if (content_type == "text") {
                senderData = { sender: userDetails.name, message };
                notificationType = NOTIFICATION_TYPES.TEXT;
              } else if (content_type == "image") {
                senderData = { sender: userDetails.name };
                notificationType = NOTIFICATION_TYPES.IMAGE;
              } else if (content_type == "video") {
                senderData = { sender: userDetails.name };
                notificationType = NOTIFICATION_TYPES.VIDEO;
              } else if (content_type == "emoticon") {
                senderData = { sender: userDetails.name };
                notificationType = NOTIFICATION_TYPES.EMOTICON;
              }
            }

            pushNotificationService.sendNotification(
              notificationUserIds,
              notificationType,
              senderData,
              {
                room_id: roomDetails.id,
                room_name: roomDetails.group_name,
                room_address: roomDetails.address,
                conversation_id: conversationId,
              },
              badgeNumbers,
            );
          }

          if (notificationSilentUserIds.length !== 0) {
            let badgeSilentNumbers = await userService.getUnreadMessageCountByMultipleUser(
              notificationSilentUserIds,
            );
            pushNotificationService.sendBadgeCountNotification(
              notificationSilentUserIds,
              "BATCH_COUNT",
              badgeSilentNumbers,
            );
          }
        }
      } catch (e) {
        //console.log("[error]", "sendMessage :", e);
      }
    });

    socket.on("createRoom", async (data) => {
      try {
        //console.log("[socket]", "createRoom", data);
        const { room_id } = data;

        // get chatroom details by room id
        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        // join in particular room
        socket.join(roomDetails.room_unique_id);
      } catch (e) {
        // console.log("[error]", "createRoom :", e);
      }
    });

    socket.on("joinRoom", async (data) => {
      try {
        //console.log("[socket]", "joinRoom", data);

        const { room_id } = data;

        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);

        const [roomDetails, chatMemberDetails] = await Promise.all([
          chatService.getByRoomId(room_id),
          chatMembersService.getChatroomMember(room_id, userDetails.userId),
        ]);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        if (chatMemberDetails) {
          // rejoining user in group if joined before
          if (chatMemberDetails.status === "deleted") {
            const updateMemberData = {
              status: "active",
              updated_by: userDetails.userId,
              update_date: correntUTC,
              last_activity_date: correntUTC,
            };
            await chatMembersService.updateMember(updateMemberData, chatMemberDetails.id);
          }
        } else {
          // inserting and join in new group
          const insertMembersData = {
            room_id,
            user_id: userDetails.userId,
            member_type: "member",
            created_by: userDetails.userId,
            create_date: correntUTC,
            last_activity_date: correntUTC,
          };
          await chatMembersService.joinOpenChatroom(insertMembersData);
        }

        const broadcastData = {
          conversation_id: getRandomNumbers(1000000000000, 9000000000000),
          conversation_recipient_id: getRandomNumbers(1000000000000, 9000000000000),
          timestamp: correntUTCMilliseconds,
          content_type: "join",
          message: userDetails.name + req.__("userHasArrived"),
          user_id: userDetails.userId,
          user_name: userDetails.name,
          profile_image: userDetails.profile_image,
          room_id,
        };
        const roomUniqueId = roomDetails.room_unique_id;
        socket.join(roomUniqueId);
        // getting user sockets of particular user and rejoing multi device
        const userSockets = await userSocketsService.getUserSockets(socket.userDetails.userId);
        if (userSockets.length > 0) {
          for (const socketData of userSockets) {
            if (socketData.socket_id !== socket.id) {
              socket.broadcast
                .to(socketData.socket_id)
                .emit("joinMe", { room_unique_id: roomUniqueId, ...broadcastData });
            }
          }
        }
        // sending data other members of particular room
        socket.broadcast.to(roomUniqueId).emit("acknowledgement", broadcastData);
        // sending data current user
        socket.emit("acknowledgement", broadcastData);
      } catch (e) {
        //console.log("[error]", "joinRoom :", e);
      }
    });

    socket.on("joinMe", async (data) => {
      try {
        //console.log("[socket]", "joinMe");

        // multi device join and sending details
        socket.join(data.room_unique_id);
        const broadcastData = {
          conversation_id: data.conversation_id,
          conversation_recipient_id: data.conversation_recipient_id,
          timestamp: data.timestamp,
          content_type: data.content_type,
          message: data.message,
          user_id: data.user_id,
          user_name: data.user_name,
          room_id: data.room_id,
        };
        socket.emit("acknowledgement", broadcastData);
      } catch (e) {
        //console.log("[error]", "joinMe :", e);
      }
    });

    socket.on("readMessage", async (data) => {
      try {
        //console.log("[socket]", "readMessage");
        let responseData = [];
        const { room_id } = data;
        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();

        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const chatConversations = await chatService.getUserAllUnreadMessages(
          userDetails.userId,
          roomDetails.id,
        );

        if (chatConversations) {
          for (const conversation of chatConversations) {
            const updateData = {
              has_read: "y",
              updated_by: userDetails.userId,
              update_date: correntUTC,
            };
            await coversationRecipientService.updateUnreadRecipientToRead(
              updateData,
              conversation.id,
              userDetails.userId,
            );
            const unreadCount = await chatService.getCountAllUnreadMessages(conversation.id);
            let chatconversation = {
              message_id: conversation.id,
              unread_count: unreadCount,
            };
            responseData.push(chatconversation);
          }
        }

        io.in(roomDetails.room_unique_id).emit("acknowledgement", responseData);

        const notificationSilentUserIds = [userDetails.userId];
        let badgeSilentNumbers = await userService.getUnreadMessageCountByMultipleUser(
          notificationSilentUserIds,
        );
        pushNotificationService.sendBadgeCountNotification(
          notificationSilentUserIds,
          "BATCH_COUNT",
          badgeSilentNumbers,
        );
      } catch (e) {
        //console.log("[error]", "readMessage :", e);
      }
    });

    socket.on("readLatestMessage", async (data) => {
      try {
        //console.log("[socket]", "readLatestMessage");
        let responseData = [];
        const { room_id, start_conversation_id, end_conversation_id } = data;
        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();

        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const chatConversations = await chatService.getUserAllLatestUnreadMessages(
          userDetails.userId,
          roomDetails.id,
          start_conversation_id,
          end_conversation_id,
        );

        if (chatConversations) {
          for (const conversation of chatConversations) {
            const updateData = {
              has_read: "y",
              updated_by: userDetails.userId,
              update_date: correntUTC,
            };
            await coversationRecipientService.updateUnreadRecipientToRead(
              updateData,
              conversation.id,
              userDetails.userId,
            );
            const unreadCount = await chatService.getCountAllUnreadMessages(conversation.id);
            let chatconversation = {
              message_id: conversation.id,
              unread_count: unreadCount,
            };
            responseData.push(chatconversation);
          }
        }

        io.in(roomDetails.room_unique_id).emit("acknowledgement", responseData);

        const notificationSilentUserIds = [userDetails.userId];
        let badgeSilentNumbers = await userService.getUnreadMessageCountByMultipleUser(
          notificationSilentUserIds,
        );
        pushNotificationService.sendBadgeCountNotification(
          notificationSilentUserIds,
          "BATCH_COUNT",
          badgeSilentNumbers,
        );
      } catch (e) {
        //console.log("[error]", "readLatestMessage :", e);
      }
    });

    socket.on("reportedMessageDetails", async (data) => {
      try {
        //console.log("[socket]", "reportedMessageDetails");
        const { conversation_id, room_id } = data;
        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const userDetails = socket.userDetails;
        const conversation = await chatService.getConversations(conversation_id);

        let conversationAttachments = [];

        if (conversation.content_type == "image" || conversation.content_type == "video") {
          conversationAttachments = await chatService.getConversationAttachments(conversation_id);
        }

        //const conversationIDS = await chatService.getConversations(message_id);
        const unreadCount = await chatService.getCountAllUnreadMessages(conversation_id);
        const responseData = {
          local_conversation_id: "",
          conversation_id: conversation_id,
          conversation_recipient_id: conversation_id,
          timestamp: dayjs(conversation.create_date).valueOf(),
          content_type: conversation.content_type,
          message: conversation.message,
          is_reported: conversation.is_reported === 0 ? false : true,
          url_meta: conversation.url_meta == null ? "" : conversation.url_meta,
          user_id: userDetails.userId,
          user_name: userDetails.name,
          profile_image: userDetails.profile_image,
          unread_count: unreadCount,
          room_id,
          room_name: roomDetails.group_name,
          room_image_url: envs.aws.cdnpath + roomDetails.group_image,
        };
        let parentResponseData = {};

        if (conversation.parent_message_id) {
          const parentConversations = await chatService.getConversations(
            conversation.parent_message_id,
          );
          parentResponseData = {
            local_conversation_id: "",
            conversation_id: parentConversations.id,
            conversation_recipient_id: parentConversations.id,
            timestamp: dayjs(parentConversations.create_date).valueOf(),
            content_type: parentConversations.content_type,
            message: parentConversations.message,
            url_meta: parentConversations.url_meta,
            user_id: parentConversations.user_id,
            user_name: parentConversations.name,
            profile_image: parentConversations.profile_image,
            room_id: parentConversations.room_id,
            is_reported: parentConversations.is_reported === 0 ? false : true,
          };

          if (
            parentConversations.content_type == "image" ||
            parentConversations.content_type == "video"
          ) {
            const parentConversationAttachments = await chatService.getConversationAttachments(
              parentConversations.id,
            );
            Object.assign(parentResponseData, {
              ["attachments"]: JSON.stringify(parentConversationAttachments),
            });
          }
        }

        if (conversation.content_type == "image" || conversation.content_type == "video") {
          Object.assign(responseData, { ["attachments"]: JSON.stringify(conversationAttachments) });
        }
        Object.assign(responseData, { ["parentData"]: JSON.stringify(parentResponseData) });

        // sending data to all user including sender of particular room
        io.in(roomDetails.room_unique_id).emit("acknowledgement", responseData);

        // socket.emit("acknowledgement", responseData);
      } catch (e) {
        //console.log("[error]", "reportedMessageDetails :", e);
      }
    });

    socket.on("roomDetails", async (data) => {
      try {
        //console.log("[socket]", "roomDetails");
        const { room_id } = data;
        const userDetails = socket.userDetails;
        const userChatrooms = await chatService.getUserChatroomsByRoomID(
          userDetails.userId,
          room_id,
        );
        let currentDateTime = await getCurrentDateTime();
        let diffMsg = "";
        let room_recent_timestamp = 0;
        let latest_message = "";
        if (userChatrooms.latest_message_time) {
          diffMsg = await getDateDifferenceString(
            currentDateTime,
            userChatrooms.latest_message_time,
          );
          room_recent_timestamp = await convertDateToMillisecond(userChatrooms.latest_message_time);
        }
        latest_message =
          userChatrooms.latest_message == "image" ||
          userChatrooms.latest_message == "video" ||
          userChatrooms.latest_message == "emoticon"
            ? req.__(userChatrooms.latest_message)
            : userChatrooms.latest_message;
        let chatroom = {
          room_id: userChatrooms.id,
          room_unique_id: userChatrooms.room_unique_id,
          room_name: userChatrooms.group_name,
          room_image_url: userChatrooms.group_image,
          room_image_medium_url: userChatrooms.group_image_medium,
          room_image_small_url: userChatrooms.group_image_small,
          room_type: userChatrooms.group_type,
          unread_message_count: userChatrooms.total_unread,
          latest_message:
            userChatrooms.latest_message == "info" || !userChatrooms.latest_message
              ? ""
              : latest_message,
          latest_message_id: userChatrooms.latest_message_id,
          room_recent_time: diffMsg,
          room_recent_timestamp: dayjs(room_recent_timestamp).valueOf(),
          room_users_count: userChatrooms.active_members,
          room_owner: userChatrooms.owner === 0 ? false : true,
          country: userChatrooms.country,
          city: userChatrooms.city,
        };

        //io.in(userChatrooms.room_unique_id).emit("room_acknowledgement", chatroom);
        socket.emit("room_acknowledgement", chatroom);
      } catch (e) {
        //console.log("[error]", "roomDetails :", e);
      }
    });

    socket.on("userInsideChatroom", async (data) => {
      try {
        //console.log("[socket]", "userInsideChatroom");
        const { room_id, is_inside_chatroom } = data;
        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();

        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");
        const updateMemberData = {
          updated_by: userDetails.userId,
          is_online: is_inside_chatroom,
          update_date: correntUTC,
        };
        await chatMembersService.updateChatroomMember(
          updateMemberData,
          userDetails.userId,
          room_id,
        );
      } catch (e) {
        //console.log("[error]", "userInsideChatroom :", e);
      }
    });

    socket.on("leftRoom", async (data) => {
      try {
        //console.log("[socket]", "leftRoom", data);

        const { room_id } = data;

        const userDetails = socket.userDetails;
        const [roomDetails, chatMemberDetails] = await Promise.all([
          chatService.getByRoomId(room_id),
          chatMembersService.getChatroomMember(room_id, userDetails.userId),
        ]);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");
        if (chatMemberDetails.status === "deleted")
          throw StatusError.badRequest("memberNotExistsInRoom");

        const roomUniqueId = roomDetails.room_unique_id;
        socket.leave(roomUniqueId);
        // getting user sockets of particular user and leaving multi device
        const userSockets = await userSocketsService.getUserSockets(socket.userDetails.userId);
        if (userSockets.length > 0) {
          for (const socketData of userSockets) {
            if (socketData.socket_id !== socket.id) {
              socket.broadcast
                .to(socketData.socket_id)
                .emit("leaveMe", { room_unique_id: roomUniqueId });
            }
          }
        }

        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);

        const is_owner = await chatMembersService.checkOwnerGroupMember(
          room_id,
          userDetails.userId,
        );

        const updateMemberData = {
          status: "deleted",
          member_type: "member",
          updated_by: userDetails.userId,
          update_date: correntUTC,
        };
        await chatMembersService.updateMember(updateMemberData, chatMemberDetails.id);

        // update the conversationTable when user is left
        const updateConversationData = {
          is_left: 1,
        };
        await conversationService.updateCoversationByUserID(
          updateConversationData,
          room_id,
          userDetails.userId,
        );

        const memberList = await chatMembersService.getGroupMembersList(room_id);

        if (is_owner > 0) {
          let next_user_id = userDetails.userId;
          let updateChatRoomData = {
            update_date: correntUTC,
          };
          if (
            (roomDetails.passcode == null || roomDetails.passcode == "") &&
            memberList.length > 0
          ) {
            const nextMemberData = await chatMembersService.getNextGroupMember(room_id);
            next_user_id = nextMemberData.user_id;
            const updateNextMemberData = {
              member_type: "owner",
              updated_by: userDetails.userId,
              update_date: correntUTC,
            };
            await chatMembersService.updateMember(updateNextMemberData, nextMemberData.id);

            updateChatRoomData["user_id"] = next_user_id;
          } else {
            updateChatRoomData["is_moderator_left"] = 1;
            updateChatRoomData["status"] = "deleted";
          }

          updateChatRoomData["updated_by"] = userDetails.userId;

          await chatService.updateOpenGroup(updateChatRoomData, room_id);
        }

        const insertMessageData = {
          user_id: userDetails.userId,
          room_id,
          content_type: "info",
          message: GROUP_INFOS.USER_LEFT,
          create_date: correntUTC,
        };
        const conversationId = await conversationService.createCoversation(insertMessageData);

        if (memberList.length > 0) {
          const insertRecipientsData = [];
          for (const member of memberList) {
            insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
          }
          await coversationRecipientService.createRecipients(insertRecipientsData);
        }
        // delete chatroom if last user leaving
        if (memberList.length == 0) {
          const updateObj = {
            status: "deleted",
          };
          await chatService.updateChatroom(updateObj, roomDetails.id);
        }

        const participating_room_count = await chatMembersService.getCountUserChatrooms(
          userDetails.userId,
        );

        const broadcastData = {
          conversation_id: conversationId,
          conversation_recipient_id: getRandomNumbers(1000000000000, 9000000000000),
          timestamp: correntUTCMilliseconds,
          content_type: "left",
          message: userDetails.name + req.__("userHasLeft"),
          user_id: userDetails.userId,
          user_name: userDetails.name,
          profile_image: userDetails.default_profile_image,
          room_id,
          participating_room_count: participating_room_count,
        };
        // sending data to all members of particular room
        io.in(roomUniqueId).emit("acknowledgement", broadcastData);
        const broadcastDataSender = {
          conversation_id: conversationId,
          conversation_recipient_id: getRandomNumbers(1000000000000, 9000000000000),
          timestamp: correntUTCMilliseconds,
          content_type: "leave",
          message: userDetails.name + req.__("userHasLeft"),
          user_id: userDetails.userId,
          user_name: userDetails.name,
          room_id,
          participating_room_count: participating_room_count,
        };
        // sending leave data to current user
        socket.emit("acknowledgement", broadcastDataSender);
      } catch (e) {
        //console.log("[error]", "leftRoom :", e);
      }
    });

    socket.on("leaveMe", async (data) => {
      try {
        //console.log("[socket]", "leaveMe");
        socket.leave(data.room_unique_id);
      } catch (e) {
        //console.log("[error]", "leaveMe :", e);
      }
    });

    socket.on("kickOutRoom", async (data) => {
      try {
        //console.log("[socket]", "kickOutRoom", data);

        const { room_id, chat_member_id } = data;

        //const userDetails = socket.userDetails;
        const [roomDetails, memberList] = await Promise.all([
          chatService.getByRoomId(room_id),
          chatMembersService.getGroupMembersList(room_id),
        ]);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const roomUniqueId = roomDetails.room_unique_id;
        //socket.leave(roomUniqueId);
        // getting user sockets of particular user and leaving multi device
        const userSockets = await userSocketsService.getUserSockets(chat_member_id);
        if (userSockets.length > 0) {
          for (const socketData of userSockets) {
            if (socketData.socket_id !== socket.id) {
              socket.broadcast
                .to(socketData.socket_id)
                .emit("leaveMe", { room_unique_id: roomUniqueId });
            }
          }
        }

        const memberDetails = await userService.getByUserId(chat_member_id);
        if (!memberDetails) throw StatusError.badRequest("userNotExists");

        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);

        const insertMessageData = {
          user_id: memberDetails.id,
          room_id,
          content_type: "info",
          message: GROUP_INFOS.USER_KICK_OUT,
          create_date: correntUTC,
        };
        const conversationId = await conversationService.createCoversation(insertMessageData);

        if (memberList.length > 0) {
          const insertRecipientsData = [];
          for (const member of memberList) {
            insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
          }
          await coversationRecipientService.createRecipients(insertRecipientsData);
        }

        // delete chatroom if last user leaving
        if (memberList.length < 1) {
          const updateObj = {
            status: "deleted",
          };
          await chatService.updateChatroom(updateObj, roomDetails.id);
        }

        const broadcastData = {
          conversation_id: conversationId,
          conversation_recipient_id: getRandomNumbers(1000000000000, 9000000000000),
          timestamp: correntUTCMilliseconds,
          content_type: "left",
          message: memberDetails.name + req.__("userKickOut"),
          user_id: memberDetails.id,
          user_name: memberDetails.name,
          profile_image: memberDetails.default_profile_image,
          room_id,
        };
        // sending data to all members of particular room
        io.in(roomUniqueId).emit("acknowledgement", broadcastData);
      } catch (e) {
        //console.log("[error]", "kickOutRoom :", e);
      }
    });

    socket.on("changedPasscode", async (data) => {
      try {
        //console.log("[socket]", "changePasscode", data);

        const { conversation_id } = data;
        let conversationData = await chatService.getConversationbyID(conversation_id);
        const conversationId = conversation_id;

        //const userDetails = socket.userDetails;
        const roomDetails = await chatService.getByRoomId(conversationData.room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const roomUniqueId = roomDetails.room_unique_id;

        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);

        const broadcastData = {
          conversation_id: conversationId,
          conversation_recipient_id: getRandomNumbers(1000000000000, 9000000000000),
          timestamp: correntUTCMilliseconds,
          content_type: "info",
          message: req.__(conversationData.message),
          user_id: conversationData.user_id,
          room_id: conversationData.room_id,
        };
        // sending data to all members of particular room
        io.in(roomUniqueId).emit("acknowledgement", broadcastData);
      } catch (e) {
        //console.log("[error]", "changedPasscode :", e);
      }
    });

    socket.on("clearNotice", async (data) => {
      try {
        const { room_id, notice_id } = data;
        const userDetails = socket.userDetails;
        const correntUTC = await getCurrentUTCTime();
        const correntUTCMilliseconds = await convertDateToMillisecond(correntUTC);
        const roomDetails = await chatService.getByRoomId(room_id);
        if (!roomDetails) throw StatusError.badRequest("groupNotExists");

        const noticeDetails = await chatService.getNoticeData(notice_id);
        const isDisplayChatroom = noticeDetails.is_display_chatroom;

        if (isDisplayChatroom == "y") {
          const insertMessageData = {
            user_id: userDetails.userId,
            room_id,
            content_type: "info",
            message: "공지 메시지가 해제되었습니다",
            is_notice: "y",
            create_date: correntUTC,
          };
          const conversationNoticeId = await conversationService.createCoversation(
            insertMessageData,
          );

          const broadcastData = {
            room_id: room_id,
            conversation_id: conversationNoticeId,
            show_notice: false,
            content_type: "notice",
            message: "공지 메시지가 해제되었습니다",
            timestamp: correntUTCMilliseconds,
            user_id: userDetails.userId,
            user_name: userDetails.name,
            profile_image: userDetails.default_profile_image,
          };
          // sending data to all members of particular room
          const userSockets = await userSocketsService.getUserSocketsByRoomID(room_id);
          if (userSockets.length > 0) {
            for (const socketData of userSockets) {
              const check_app_version =
                (await compareAppVersions(socketData.app_latest_version, "8.5.0")) < 0;
              if (check_app_version === false) {
                socket.broadcast.to(socketData.socket_id).emit("acknowledgement", broadcastData);
              }
            }
          }
          socket.emit("acknowledgement", broadcastData);
        }

        const updateData = {
          is_display_chatroom: "n",
          status: "deleted",
          updated_by: userDetails.userId,
          update_date: correntUTC,
        };
        await conversationService.updateCoversationNotice(updateData, notice_id);
      } catch (e) {
        //console.log("[error]", "clearNotice :", e);
      }
    });

    socket.on("disconnect", async () => {
      try {
        //console.log("[socket]", "disconnect", socket.id);

        // delete user socket data from db
        await userSocketsService.deleteUserSocket(socket.id);
      } catch (e) {
        //console.log("[error]", "disconnect :", e);
      }
    });
  });
};
