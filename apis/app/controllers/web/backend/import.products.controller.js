const { messages } = require("../../../../config/constants");
const { deliverResponse } = require("../../../../util/responseHelper");
const {
  Category,
  ProductHead,
  FileImport,
  Admin,
  Product,
} = require("../../../db");
const AWS = require("aws-sdk");
const fs = require("fs");
const csv = require("csv-parser");
const logger = require("../../../../config/constants/logger");

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const uploadFileToS3 = async (fileItem) => {
  const fileBody = fs.readFileSync(fileItem.path);
  const fileKey = `imports/${Date.now()}_${fileItem.originalname}`;
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: process.env.AWS_S3BUCKET_NAME,
        Key: fileKey,
        Body: fileBody,
        // ACL: 'public-read', // Uncomment this line once the ACL is set
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({ ...response, fileKey });
        }
      }
    );
  });
};

const countCSVRows = (s3Location) => {
  let rowCount = 0;
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: s3Location,
    })
      .createReadStream()
      .pipe(csv())
      .on("data", () => {
        rowCount++;
      })
      .on("end", () => {
        resolve(rowCount);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const processCategories = async (s3Location, importId, adminId) => {
  const categories = await Category.find({ isDelete: false });
  let categoriesMap = {};
  categories.forEach((category) => (categoriesMap[category.name] = category));
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: s3Location,
    })
      .createReadStream()
      .pipe(csv())
      .on("data", (row) => {
        if (["simple-item", "variant"].includes(row.type)) {
          const categories = row.categories.split(", ");
          categories.forEach((category) => {
            const categoryItems = category.split(" > ");
            categoryItems.forEach((categoryItem, index) => {
              if (!categoriesMap[categoryItem]) {
                categoriesMap[categoryItem] = new Category({
                  name: categoryItem,
                  slug: categoryItem.toLowerCase().replace(/ /g, "-"),
                  parent:
                    index === 0
                      ? null
                      : categoriesMap[categoryItems[index - 1]]._id,
                  root:
                    index === 0 ? null : categoriesMap[categoryItems[0]]._id,
                  isRoot: index === 0 ? true : false,
                  path:
                    index > 0 && categoryItems.length > 2
                      ? categoryItems.slice(0, index).join(" > ")
                      : categoryItems.slice(0, index).join(""),
                  createdBy: adminId,
                });
                categoriesMap[categoryItem]
                  .save()
                  .then(() => {
                    logger.info({
                      importId,
                      message: `[category] ${new Date().toLocaleString()} Category ${categoryItem} added successfully`,
                    });
                  })
                  .catch((error) => {
                    logger.error({
                      importId,
                      message: `[category] ${new Date().toLocaleString()} Error while adding category ${categoryItem}: ${
                        error.message
                      }`,
                    });
                  });
              }
            });
          });
        }
      })
      .on("end", () => {
        resolve(categoriesMap);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const processConfigItems = async (s3Location, importId, adminId) => {
  const configItems = await ProductHead.find({ isDelete: false });
  let configItemsMap = {};
  configItems.forEach(
    (configItem) => (configItemsMap[configItem.sku] = configItem)
  );
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: s3Location,
    })
      .createReadStream()
      .pipe(csv())
      .on("data", (row) => {
        if (row.type === "config-item") {
          if (configItemsMap[row.sku]) {
            logger.info({
              importId,
              message: `[config-item] ${new Date().toLocaleString()} Config item ${
                row.sku
              } already exists`,
            });
          } else {
            configItemsMap[row.sku] = new ProductHead({
              name: row.name,
              sku: row.sku,
              slug: row.name.toLowerCase().replace(/ /g, "-"),
              createdBy: adminId,
            });
            configItemsMap[row.sku]
              .save()
              .then(() => {
                logger.info({
                  importId,
                  message: `[config-item] ${new Date().toLocaleString()} Config item ${
                    row.name
                  } added successfully`,
                });
              })
              .catch((error) => {
                logger.error({
                  importId,
                  message: `[config-item] ${new Date().toLocaleString()} Error while adding config item ${
                    row.name
                  }: ${error.message}`,
                });
              });
          }
        }
      })
      .on("end", () => {
        resolve(configItemsMap);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const processAttributes = (rowItem, importType = "create") => {
  let attributes = [];
  let options = {};
  let optionTypes = {};

  for (let key in rowItem) {
    if (/^option\d+(Name|Value)$/.test(key)) {
      let field = key?.split("option")[1];
      let optionName = rowItem[key];

      if (field?.endsWith("Name")) {
        options[optionName] = "";
        optionTypes[optionName] =
          optionName.toLowerCase() === "color" ? "color" : "text";
      } else if (field?.endsWith("Value")) {
        for (let option in options) {
          if (!options[option]) {
            options[option] = optionName;
            break;
          }
        }
      }
    }

    attributes = Object.entries(options)
      .map(([title, value]) => {
        if (title && value) {
          return {
            title,
            value,
            type: optionTypes[title],
          };
        }
      })
      .filter(Boolean);
  }

  if (importType == "update" && attributes.length > 0) {
    return attributes;
  } else if (importType == "update" && attributes.length == 0) {
    return;
  } else {
    return attributes;
  }
};

const processProducts = async (
  s3Location,
  categories,
  configItems,
  importId,
  adminId
) => {
  const products = await Product.find({ isDelete: false });
  let productsMap = {};
  let processedRows = 0;
  let skippedRows = 0;

  products.forEach((product) => (productsMap[product.sku] = product));

  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: s3Location,
    })
      .createReadStream()
      .pipe(csv())
      .on("data", async (row) => {
        if (["simple-item", "variant"].includes(row.type)) {
          if (!row.sku) {
            skippedRows++;
            logger.error({
              importId,
              message: `[product] ${new Date().toLocaleString()} Product skipped due to missing sku`,
            });
            return;
          }

          if (!row.parent_sku) {
            skippedRows++;
            logger.error({
              importId,
              message: `[product] ${new Date().toLocaleString()} Product ${
                row.sku
              } skipped due to missing parent sku`,
            });
            return;
          }

          const configItem = configItems[row.parent_sku];
          const relatedSkus = row.relatedProducts.split(",").map(sku => sku.trim());
          const relatedIds = relatedSkus.map(
            (relatedSku) =>
              productsMap[relatedSku] && productsMap[relatedSku]._id
          );
          
          const categoryItems = [];
          const categoriesLists = row.categories.split(", ");
          categoriesLists.forEach((category) => {
            const productCategories = category.split(" > ");
            productCategories.forEach((categoryItem) => {
              categoryItems.push(categories[categoryItem]);
            });
          });

          const categoryIds = [];
          categoryItems.forEach((categoryItem) => {
            if (!categoryIds.includes(categoryItem._id)) {
              categoryIds.push(categoryItem._id);
            }
          });

          const attributes = processAttributes(row, "update");
          const sanitizedAttributes = Array.isArray(attributes)
            ? attributes.filter(Boolean)
            : [];

          const productData = {
            name: row.name,
            slug: `${
              row.name
                .toLowerCase()
                .trim() // Remove leading/trailing whitespace
                .replace(/\s+/g, "-") // Replace multiple spaces with single dash
                .replace(/-+/g, "-") // Replace multiple dashes with single dash
                .replace(/[^a-z0-9-]/g, "") // Remove any characters that aren't letters, numbers, or dashes
            }-${row.sku}`,
            sku: row.sku,
            category: categoryIds,
            overview: row.excerpt,
            video: row.video,
            stock: row.quantity,
            relatedProducts: relatedIds,
            attributes: sanitizedAttributes,
            price: {
              mrp: row.originalPrice,
              offer: row.storePrice,
              production: row.productionPrice,
              selling: row.storePrice,
            },
            donationPercentage: Number(row.donationPercentage),
            thumbnail: row.thumbImg,
            hoverThumbnail: row.hoverThumbImg,
            parentId: configItem?._id,
            product: configItem?._id,
            files: row.otherMedia.split(","),
            rating: row.rating,
            isVisible: row.isVisible === "FALSE" ? false : true,
            searchKeywords: row.searchKeywords && row.searchKeywords.split(","),
            metaTitle: row.metaName,
            metaDescription: row.metaDesc,
            metaKeywords: row.metaKeywords,
            details: {
              description: row.description,
              returnPolicy: row.returnPolicy,
              sizeChart: row.sizeChart,
            },
          };

          try {
            if (productsMap[row.sku]) {
              // Update existing product
              await Product.findByIdAndUpdate(
                productsMap[row.sku]._id,
                productData,
                { new: true }
              );
              logger.info({
                importId,
                message: `[product] ${new Date().toLocaleString()} Product ${
                  row.sku
                } updated successfully`,
              });
            } else {
              // Create new product
              const newProduct = new Product(productData);
              await newProduct.save();
              productsMap[row.sku] = newProduct;
              logger.info({
                importId,
                message: `[product] ${new Date().toLocaleString()} Product ${
                  row.sku
                } added successfully`,
              });
            }
            processedRows++;
          } catch (error) {
            logger.error({
              importId,
              message: `[product] ${new Date().toLocaleString()} Error processing product ${
                row.sku
              }: ${error.message}`,
            });
          }
        }
      })
      .on("end", () => {
        resolve({ processedRows, skippedRows, products: productsMap });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const createFileImport = async (fileDetails) => {
  const response = new FileImport(fileDetails);
  return response.save();
};

exports.createBulkProducts = async (req, res) => {
  const { file } = req;
  const { email } = res.locals.user;

  if (!file) {
    return deliverResponse(res, 422, {}, messages.fileNotFound);
  }

  const admin = await Admin.findOne({ email }).lean();
  const s3UploadResponse = await uploadFileToS3(file);
  const totalRows = await countCSVRows(s3UploadResponse.fileKey);
  const startTime = new Date().toISOString();
  const fileImport = await createFileImport({
    title: file.originalname,
    slug: file.originalname.toLowerCase().replace(/ /g, "-"),
    s3Location: s3UploadResponse.Location,
    totalRows,
    status: "progress",
    type: "products",
    startTime,
    createdBy: admin._id,
  });
  const importId = fileImport._id.toString();

  logger.info({
    importId,
    message: `${new Date().toLocaleString()} File ${
      file.originalname
    } uploaded successfully`,
  });
  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Processing started`,
  });
  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Total rows: ${totalRows}`,
  });
  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Import ID: ${importId}`,
  });

  deliverResponse(res, 200, { importId }, messages.importStarted);

  const [configItemsResponse, categoriesResponse] = await Promise.all([
    processConfigItems(s3UploadResponse.fileKey, importId, admin._id),
    processCategories(s3UploadResponse.fileKey, importId, admin._id),
  ]);

  if (configItemsResponse instanceof Error) {
    logger.error({
      importId,
      message: `${new Date().toLocaleString()} Error while processing config items`,
    });
    return deliverResponse(res, 422, configItemsResponse, messages.serverError);
  }

  if (categoriesResponse instanceof Error) {
    logger.error({
      importId,
      message: `${new Date().toLocaleString()} Error while processing categories`,
    });
    return deliverResponse(res, 422, categoriesResponse, messages.serverError);
  }

  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Categories and config items processed successfully`,
  });
  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Processing products`,
  });
  const productsResponse = await processProducts(
    s3UploadResponse.fileKey,
    categoriesResponse,
    configItemsResponse,
    importId,
    admin._id
  );

  if (productsResponse instanceof Error) {
    logger.error({
      importId,
      message: `${new Date().toLocaleString()} Error while processing products`,
    });
    return deliverResponse(res, 422, productsResponse, messages.serverError);
  }

  logger.info({
    importId,
    message: `${new Date().toLocaleString()} Products processed successfully`,
  });
  const endTime = new Date().toISOString();
  const executionTime = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
  );

  FileImport.updateOne(
    { _id: importId },
    {
      $set: {
        status: "completed",
        endTime,
        executionTime,
        processedRows: productsResponse.processedRows,
        skippedRows: productsResponse.skippedRows,
      },
    }
  )
    .then(() => {
      logger.info({
        importId,
        message: `${new Date().toLocaleString()} File import completed`,
      });
    })
    .catch((error) => {
      console.log(error, "error");
      logger.error({
        importId,
        message: `${new Date().toLocaleString()} Error while updating file import: ${
          error.message
        }`,
      });
    });
};
