/**
 * Get Test Content
 * @param req
 * @param res
 * @param next
 */
export const getContent = async (req, res, next) => {
  try {
    const groupMembersDetailsResult = "This is a test content";

    res.status(200).send({
      content: groupMembersDetailsResult,
    });
  } catch (error) {
    next(error);
  }
};
