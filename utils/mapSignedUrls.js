const { getObjectSignedUrl } = require("./s3Utils"); // adjust path if needed

// Converts S3 keys to signed URLs for a Business object
const attachSignedUrlsToBusiness = async (business) => {
  const getUrl = async (key) => (key ? await getObjectSignedUrl(key) : null);

  const signedPhotos = await Promise.all(
    (business.photos || []).map((key) => getUrl(key))
  );

  const logoUrl = await getUrl(business.logoUrl);
  const primaryPhoto = await getUrl(business.primaryPhoto);

  return {
    ...business.toObject(), // convert Mongoose doc to plain JS object
    photos: signedPhotos,
    logoUrl,
    primaryPhoto,
  };
};

// Converts S3 keys to signed URLs for a FeedPost
const attachSignedUrlsToPost = async (post) => {
  const getUrl = async (key) => (key ? await getObjectSignedUrl(key) : null);

  const signedImageUrl = await getUrl(post.imageUrl);

  let business = post.business;
  if (business && business.logoUrl) {
    const signedLogoUrl = await getUrl(business.logoUrl);
    business = {
      ...(business.toObject?.() ?? business), // handles both populated or plain
      logoUrl: signedLogoUrl,
    };
  }

  return {
    ...(post.toObject?.() ?? post), // handle Mongoose doc or plain obj
    imageUrl: signedImageUrl,
    business,
  };
};

module.exports = { attachSignedUrlsToBusiness, attachSignedUrlsToPost };
