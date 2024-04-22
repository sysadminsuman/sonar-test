import { awsFileUnlink } from "../../helpers/index.js";
import { cornService } from "../../services/index.js";

/**
 * insert tag list
 * @param req
 * @param res
 * @param next
 */
export const expiredmedia = async (req, res, next) => {
  try {
    let compromisedmedia = await cornService.getExpirable();
    if (compromisedmedia.length > 0) {
      var myArray = [];
      for (var i = 0; i < compromisedmedia.length; i += 20) {
        myArray.push(compromisedmedia.slice(i, i + 20));
        // awsFileUnlink(fles);
        // await cornService.markmediaexpired(ids);
      }

      compromisedmedia = [];
      let fles = [];
      let ids = [];
      myArray.forEach(async (chunk) => {
        fles = [];
        ids = [];
        chunk.forEach((media) => {
          fles.push(media.file_name);
          let urlparts = media.file_name.split("/");
          urlparts[urlparts.length - 1] = "medium/" + urlparts[urlparts.length - 1];
          if (urlparts[urlparts.length - 2] == "videos") {
            urlparts[urlparts.length - 1] = urlparts[urlparts.length - 1].split(".");
            urlparts[urlparts.length - 1][1] = "png";
            urlparts[urlparts.length - 1] = urlparts[urlparts.length - 1].join(".");
          }
          urlparts = urlparts.join("/");
          fles.push(urlparts);
          ids.push(media.id);
        });
        awsFileUnlink(fles);
        await cornService.markmediaexpired(ids);
      });
    }
    res.status(200).send({
      success: true,
      message: res.__("mediaexpirationmade"),
    });
  } catch (error) {
    //console.log(error);
    next(error);
  }
};
