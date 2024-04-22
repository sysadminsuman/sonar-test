const TABLES = {
  CHATROOMS_TABLE: "ht_chatrooms",
  CHATROOM_CONVERSATIONS_TABLE: "ht_chatroom_conversations",
  CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE: "ht_chatroom_conversation_attachments",
  CHATROOM_CONVERSATION_RECIPIENTS_TABLE: "ht_chatroom_conversation_recipients",
  CHATROOM_MEMBERS_TABLE: "ht_chatroom_members",
  CHATROOM_TAGS_TABLE: "ht_chatroom_tags",
  CHATROOM_CITIES_TABLE: "ht_chatroom_cities",
  CHATROOM_REACTIONS_TABLE: "ht_chatroom_conversation_reactions",
  USER_TABLE: "ht_users",
  USER_SOCKETS_TABLE: "ht_user_sockets",
  USER_DEVICES: "ht_user_devices",
  NOTIFICATION_TEMPLATE: "ht_notification_templates",
  TAG_TABLE: "ht_tags",
  CITY_TABLE: "ht_cities",
  COUNTRY_TABLE: "ht_countries",
  EMOTICONS_TABLE: "ht_emoticons",
  EMOTICONS_ITEMS_TABLE: "ht_emoticon_items",
  TAG_MODIFICATION_LOG_TABLE: "ht_tag_modification_logs",
  CHATROOM_MEMBER_REPORTINGS_TABLE: "ht_chatroom_member_reportings",
  CONVERSATION_REPORTINGS_TABLE: "ht_conversation_reportings",
  CITIES_CHECKING_LOGS_TABLE: "ht_cities_checking_logs",
  CITIES_NOT_FOUND_LOGS_TABLE: "ht_cities_notfound_logs",
  DEVICE_TABLE: "ht_devices",
  SETTING_TABLE: "ht_settings",
  CHATROOM_NOTICES_TABLE: "ht_chatroom_conversation_notices",
};

const PAGINATION_LIMIT = 10;

const GROUP_INFOS = {
  USER_JOIN: "userHasArrived",
  USER_LEFT: "userHasLeft",
  USER_KICK_OUT: "userKickOut",
  PASSWORD_SET: "passwordSet",
  PASSWORD_CHANGED: "passwordChanged",
  PASSWORD_REMOVE: "passwordRemove",
};

const NOTIFICATION_TYPES = {
  SEND_MESSAGE: "SEND_MESSAGE",
  TEXT: "TEXT",
  URL: "URL",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  EMOTICON: "EMOTICON",
  REPLY: "REPLY",
  GROUP_CREATED: "GROUP_CREATED",
  WITHDRAWN: "WITHDRAWN",
  FORCE_UPDATE: "FORCE_UPDATE",
  SYSTEM_POPUP: "SYSTEM_POPUP",
  APP_PARKING: "APP_PARKING",
  AAP_TERMINATION: "AAP_TERMINATION",
};

const SETTING_TYPES = {
  SEARCH_BAR_TXT: "SEARCH_BAR_TXT",
  FORCE_UPDATE_POPUP: "FORCE_UPDATE_POPUP",
  SYSTEM_POPUP: "SYSTEM_POPUP",
  APP_PARKING: "APP_PARKING",
  DEFAULT_LOCATION: "DEFAULT_LOCATION",
  AAP_TERMINATION: "AAP_TERMINATION",
};

const BASE_URL = "https://openchat-api-v2.hanatour.com/";

export { PAGINATION_LIMIT, TABLES, GROUP_INFOS, NOTIFICATION_TYPES, BASE_URL, SETTING_TYPES };
