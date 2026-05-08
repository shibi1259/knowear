const helper = require("../../../../util/responseHelper");
const constants = require("../../../../config/constants");
const { messages } = constants;
const service = require("../../../services/product.service");
const productHeadService = require("../../../services/product.head.service");
const slug = require("../../../../util/slug");
const db = require("../../../db");
const fs = require("fs")
const collectionService = require("../../../services/collection.service")
const adminService = require("../../../services/auth.service")
const brandService = require("../../../services/brand.service")
const csv = require('csv-parser');
const ne = require("../../../../util/notificationEngine");
const activity = require("../../../../util/activity.creator");
const fileImportService = require("../../../services/file.import.service");
const mediaService = require("../../../services/media.service")
const media = require("../../../../util/media.uploader");
const { Mutex } = require('async-mutex');
const mutex = new Mutex();
const ObjectId = require("mongoose").Types.ObjectId;
const AWS = require('aws-sdk');
const offerEngine = require('../../../../util/offerEngine')
const { uploadImageToS3WithUrl } = require("../../../../util/s3UploaderFromUrl");

const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const getAdminDetails = async (email) => {
  const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
  return details
}

exports.create = async (req, res) => {
  try {
    const { body } = req;
    const adminEmail = res?.locals?.user?.email
    const admin = await getAdminDetails(adminEmail)
    body.createdBy = admin?._id
    body.slug = await slug.createSlug(db.Product, body.name, { slug: await slug.generateSlug(body.name) });
    const isSkuExists = await service.findOne({ sku: body?.sku, isDelete: false })
    if (isSkuExists) {
      helper.deliverResponse(res, 200, {}, {
        error_code: messages.DUPLICATE_SKU.error_code,
        error_message: messages.DUPLICATE_SKU.error_message,
      });
    } else {
      let response = await service.create(body);
      if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        });
      } else {
        helper.deliverResponse(res, 200, response, {
          error_code: messages.PRODUCT_ADDED.error_code,
          error_message: messages.PRODUCT_ADDED.error_message,
        });
      }
    }
  } catch (error) {
    console.log("Error caught in add product API :: " + error)
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

function generateCombinations(attributes) {
  let combinations = [[]];
  for (let attribute of attributes) {
    const newCombinations = [];
    for (let value of attribute.values) {
      for (let combination of combinations) {
        newCombinations.push([...combination, { title: attribute.title, value: value }]);
      }
    }
    combinations = newCombinations;
  }
  return combinations;
}

exports.createProducts = async (req, res) => {
  try {
    const { body } = req
    console.log("body", body);
    const adminEmail = res?.locals?.user?.email

    const adminDetails = await getAdminDetails(adminEmail)
    const productResponse = await productHeadService.add({
      ...body,
      createdBy: adminDetails?._id,
      slug: await slug.createSlug(db.ProductHead, body.name, { slug: await slug.generateSlug(body.name) }),
    })

    if (productResponse instanceof Error) {
      helper.deliverResponse(res, 422, productResponse, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    } else {
      if (body?.attributes?.length > 0) {
        //Create product if attributes found
        let errorResponses = []
        let successResponses = []
        let productCount = 0
        const attributes = generateCombinations(body.attributes)
        for (let attribute of attributes) {
          let productName = body.name
          attribute.forEach(attr => { productName += ` ${attr.value}` });
          const response = await service.create({
            ...body,
            name: productName,
            sku: `${body.sku}-${await service.count({}) + 1}`,
            parentId: productResponse._id,
            product: productResponse._id,
            createdBy: adminDetails?._id,
            slug: await slug.createSlug(db.Product, productName, { slug: await slug.generateSlug(productName) }),
            attributes: attribute,
            isVisible: productCount > 0 ? false : true
          })

          if (response instanceof Error) {
            errorResponses.push(response)
            helper.deliverResponse(res, 422, response, {
              error_code: messages.serverError.error_code,
              error_message: messages.serverError.error_message,
            });
            return;
          } else {
            productCount++
            successResponses.push(response)
          }
        }
        if (errorResponses.length > 0) {
          helper.deliverResponse(res, 422, errorResponses, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          });
        } else {
          helper.deliverResponse(res, 200, successResponses, {
            error_code: messages.PRODUCT_ADDED.error_code,
            error_message: messages.PRODUCT_ADDED.error_message,
          });
        }
        //Create product if attributes found
      } else {
        //Create product if no attributes found
        const response = await service.create({
          ...body,
          sku: `${body.sku}-${await service.count({}) + 1}`,
          parentId: productResponse._id,
          product: productResponse._id,
          createdBy: adminDetails?._id,
          slug: await slug.createSlug(db.Product, body.name, { slug: await slug.generateSlug(body.name) }),
        })
        if (response instanceof Error) {
          helper.deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
          });
        } else {
          helper.deliverResponse(res, 200, response, {
            error_code: messages.PRODUCT_ADDED.error_code,
            error_message: messages.PRODUCT_ADDED.error_message,
          });
        }
        //Create product if no attributes found
      }
    }
  } catch (error) {
    console.log('Error caught in create products api :: ' + error)
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.delete = async (req, res) => {
  try {
    const { productId } = req.params
    const { email } = res?.locals?.user
    const response = await service.deleteOne({ _id: productId }, { isDelete: true })
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, response, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    } else {
      activity.logActivity(email, `Product deleted`)
      helper.deliverResponse(res, 200, response, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      });
    }
  } catch (error) {
    console.log("Error caught in delete product api :: " + error)
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.find = async (req, res, next) => {
  try {
    let response = await service.find({ isDelete: false });
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    let response = await service.find(req.body);
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in get products api :: " + error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.search = async (req, res, next) => {
  try {
    const { body } = req
    
    let query = { isDelete: false }
    if (body.name) {
      query['$or'] = [
        { name: { $regex: body.name, $options: 'i' } },
        { sku: { $regex: body.name, $options: 'i' } },
      ]
    }
    if (body?.stock) {
      if (body.stock === '1') {
        query['stock'] = { $gt: 0 }; // In Stock
      } else if (body.stock === '0') {
        query['stock'] = 0; // Out of Stock
      } else if (body.stock === '2') {
        query['stock'] = { $lte: 5, $gt: 0 }; // Limited Stock (e.g., <= 5)
      }
    }
    if (Array.isArray(body.categories) && body.categories.length > 0) {
      query['category'] = { $in: body.categories.map(id =>new ObjectId(id)) };
    }

    // NEW: Filter by product IDs
    if (Array.isArray(body.products) && body.products.length > 0) {
      query['_id'] = { $in: body.products.map(id => new ObjectId(id)) };
    }

    // NEW: Filter by product SKUs
    if (Array.isArray(body.skus) && body.skus.length > 0) {
      query['sku'] = { 
        $in: body.skus.map(sku => new RegExp(sku, 'i'))
      };
    }

    if (body?.isActive) query['isActive'] = body.isActive
    if (body?.isVisible) body?.isVisible == '0' ? query['isVisible'] = true : query['isVisible'] = false
    if (body?.parentId) query['parentId'] =new ObjectId(body.parentId)
      let sort = {};
    if (body?.sort === '0') {
      sort = { 'price.selling': -1 }; // High to Low
    } else if (body?.sort === '1') {
      sort = { 'price.selling': 1 }; // Low to High
    }    

    const response = await service.search(query, body.page, body.limit,{},sort)
    helper.deliverResponse(res, 200, response, messages.successResponse);
  } catch (_err) {    
    helper.deliverResponse(res, 422, {}, messages.serverError);
  }
}

exports.findOne = async (req, res) => {
  try {
    const response = await db.Product.findOne({ slug: req.params.product })
      .populate("category")
      .populate("relatedProducts");

    helper.deliverResponse(res, 200, response, messages.successResponse);
  } catch (error) {
    helper.deliverResponse(res, 422, error, messages.serverError);
  }
}

exports.update = async (req, res, next) => {
  try {
    const { email } = res?.locals?.user
    const { body } = req
    const productDetails = await service.findOne({ slug: body?.slug })
    const isSkuExists = await service.findOne({ sku: body?.sku, isDelete: false, _id: { $ne: new ObjectId(productDetails?._id) } })
    if (isSkuExists) {
      return helper.deliverResponse(res, 422, {}, messages.DUPLICATE_SKU);
    } else {
      if (body.name) {
        productDetails.name == body.name ? null : body.slug = await slug.createSlug(db.Product, body?.name, { slug: await slug.generateSlug(body?.name) })
      }

      if (body.isActive == false || body.isArchive == false) {
        const isCollectionExists = await collectionService.find({ products: { $in: [productDetails._id] }, isDelete: false })
        if (isCollectionExists.length > 0) {
          return helper.deliverResponse(res, 422, {}, messages.PRODUCT_ACTION_FAILED);
        }
      }

      // console.log(body);
      const response = await service.update({ _id: productDetails._id }, body)
      // console.log(response);
      if (response instanceof Error) {
        return helper.deliverResponse(res, 422, response, messages.serverError);
      } else {
        const productResponse = await service.findOne({ slug: body.slug }) // Fetching product details after update
        activity.logActivity(email, `${productResponse?.name} details updated`)

        //Push notifications for those who have enabled notify me option when out of stock
        if (productDetails?.stock == 0 && productResponse?.stock > 0) {
          await ne.stockSubscriptions({ product: productDetails?._id, redirection: `/product-detail/${productDetails?.slug}` })
        }
        //Push notifications for those who have enabled notify me option when out of stock

        //Run the offer utility function if product price has been changed
        if (body?.price?.offer != productDetails?.price?.offer) {
          console.log('Offer utility function triggered for product price change')
          await offerEngine.getOffers()
        }
        //Run the offer utility function if product price has been changed

        return helper.deliverResponse(res, 200, response, messages.PRODUCT_UPDATE);
      }
    }
  } catch (error) {
    console.log("Error caught while updating product :: " + error);
    return helper.deliverResponse(res, 422, error, messages.serverError);
  }
};

exports.createBulkProducts = async (req, res) => {
  try {
    const startTime = performance.now();
    const file = process.cwd() + "/" + req.file.path;
    const { email } = res?.locals?.user
    const adminDetails = await getAdminDetails(email)

    const fileDetails = await fileImportService.create({
      title: req?.file?.originalname, createdBy: adminDetails?._id,
      slug: await slug.createSlug(
        db.FileImport,
        req?.file?.originalname,
        { slug: await slug.generateSlug(req?.file?.originalname) }
      ),
      status: 'awaiting',
      type: 'products',
    })

    if (fileDetails instanceof Error) {
      console.log(`Error while creating file import :: ${fileDetails}`)
      return helper.deliverResponse(res, 422, fileDetails, messages.serverError);
    } else {
      let counter = 0;
      const processPromises = [];
      let processFailed = false;

      await new Promise((resolve, reject) => {
        fs.createReadStream(file).pipe(csv()).on('data', async (row) => {
          if (processFailed) return;
          counter++;
          const processPromise = processRow(row, counter, email);
          processPromises.push(processPromise);
          try {
            await processPromise;
          } catch (error) {
            processFailed = true; // Set flag to stop processing
            reject(error);
          }
        }).on('end', async () => {
          await Promise.all(processPromises);
          resolve();
        }).on('error', (error) => {
          reject(error);
        });
      })
      if (!processFailed) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        const fileAfterSuccess = await fileImportService.update(
          { _id: fileDetails._id },
          {
            status: 'completed',
            executionTime: executionTime.toFixed(2),
            dataImported: counter
          }
        );

        if (fileAfterSuccess instanceof Error) {
          return helper.deliverResponse(res, 422, fileAfterSuccess, messages.serverError);
        } else {
          await activity.logActivity(email, 'Products (csv) uploaded');
          helper.deliverResponse(res, 200, { total: counter }, {
            "error_code": 0,
            "error_message": counter + " products uploaded successfully"
          });
        }
      } else {
        const fileAfterFailure = await fileImportService.update(
          { _id: fileDetails._id }, {
          status: 'failed',
        });

        if (fileAfterFailure instanceof Error) {
          return helper.deliverResponse(res, 422, fileAfterFailure, messages.serverError);
        } else {
          return helper.deliverResponse(res, 200, { total: counter }, messages.FILE_UPLOAD_FAILED);
        }
      }
    }
  } catch (error) {
    console.log("Error caught in bulk import product :: " + error);
    return helper.deliverResponse(res, 422, {}, messages.serverError);
  }
}

async function processRow(row, counter, email) {
  return new Promise(async (resolve, reject) => {
    try {
      const release = await mutex.acquire(); // Acquire the mutex
      let parentSku = ''
      if (row.type == 'config-item') {
        parentSku = row?.sku
      } else {
        parentSku = row?.parent_sku
      }

      let parentDetails = await db.ProductHead.findOne({ sku: parentSku }); // Retrieve product head details
      let productDetails = await db.Product.findOne({ isDelete: false, sku: row?.sku });
      const taxDetails = await db.TaxClass.findOne({ name: row?.tax, isDelete: false });

      let categories = [];
      const productCategories = row?.Categories?.split(',') || row?.categories?.split(',') || []; // Split on ','

      if (productCategories.length > 0) {
        for (let category of productCategories) {
          const categoryHierarchy = category.trim().split('>'); // Split on '>'

          let parentCategoryId = null;

          for (let i = 0; i < categoryHierarchy.length; i++) {
            const categoryName = categoryHierarchy[i].trim(); // Remove extra spaces

            // Check if the current category exists under the parent (or is a root if no parent)
            let categoryDetails = await db.Category.findOne({
              name: categoryName,
              parent: parentCategoryId, // For child categories, we check for the parent
              isDelete: false
            });

            if (!categoryDetails) {
              // Create the category if it doesn't exist
              let categoryResponse = await db.Category.create({
                name: categoryName,
                isRoot: parentCategoryId ? false : true, // Root if there's no parent
                slug: await slug.generateSlug(categoryName),
                parent: parentCategoryId // Set the parent category
              });
              categoryDetails = categoryResponse;
            }

            // Update the parentCategoryId for the next iteration (child level)
            parentCategoryId = categoryDetails?._id;
          }

          // Push the final category (child) _id to the categories array
          categories.push(parentCategoryId);
        }
      }

      let files = [];
      let images = row?.otherMedia?.split(',');
      if (images) {
        for (let _image of images) {
          let urlFound = isUrl(_image) || false;
          if (urlFound) {
            try {
              let fileName = _image.split('/').pop(); // Extract filename from URL
              const fileExists = await mediaService.findOne({ title: fileName })
              if (fileExists) {
                files.push(fileExists._id)
              } else {
                fileName = fileName.split(" ").join("_"); // Replace spaces with underscores
                let result = await uploadImageToS3WithUrl(_image, fileName);
                if (result instanceof Error) {
                  console.log("Error caught from S3 in file upload :: " + error);
                } else {
                  if (fileName) {
                    let imageData = await media.uploader(email,
                      { filename: fileName, path: result?.path, mimetype: 'image/jpg', size: '0.00', },
                      { to: 'media', description: 'Media uploaded from bulk product imports' }
                    );
                    if (imageData?._id) files.push(imageData._id)
                  }
                }
              }
            } catch (error) {
              console.log("Error caught in file upload :: " + error);
            }
          } else {
            const fileExists = await mediaService.findOne({ title: _image })
            if (fileExists && fileExists?.path) files.push(fileExists?.path)
          }
        }
      }

      let thumbnail = null;
      if (row.thumbImg) {
        let urlFound = isUrl(row.thumbImg) || false;
        if (urlFound) {
          try {
            let fileName = row.thumbImg.split('/').pop();
            fileName = fileName.split(" ").join("_");
            const existingMediaDetails = await mediaService.findOne({ title: fileName })
            if (existingMediaDetails) {
              thumbnail = existingMediaDetails._id;
            } else {
              let result = await uploadImageToS3WithUrl(row.thumbImg, fileName);
              if (result instanceof Error) {
                console.log("Error caught from S3 in thumbnail upload :: " + error);
              } else {
                if (fileName) {
                  let imageData = await media.uploader(email,
                    { filename: fileName, path: result?.path, mimetype: 'image/jpg', size: '0.00', },
                    { to: 'media', description: 'Media uploaded from bulk product imports' }
                  );
                  if (imageData?._id) thumbnail = imageData?._id;
                }
              }
            }
          } catch (error) {
            console.log("Error caught in thumbnail upload :: " + error);
          }
        } else {
          const fileExists = await mediaService.findOne({ title: row.thumbImg })
          if (fileExists && fileExists?.path) thumbnail = fileExists?.path
        }
      }

      let headPayload = {
        name: row?.name ? row.name : parentDetails?.name,
        sku: parentSku ? parentSku : parentDetails?.sku,
        slug: parentDetails?.name == row?.name ? parentDetails?.slug : await slug.createSlug(db.ProductHead, row?.name, { slug: await slug.generateSlug(row?.name) }),
        tax: taxDetails ? taxDetails?._id : null,
      }

      //Attributes starts here
      let attributes = [];
      if (row.type == 'variant') {
        let options = {};
        for (let key in row) {
          if (/^option\d+(Name|Value)$/.test(key)) {
            let field = key.split('option')[1];
            let optionName = row[key];
            if (field.endsWith('Name')) {
              options[optionName] = '';
            } else if (field.endsWith('Value')) {
              for (let option in options) {
                if (!options[option]) {
                  options[option] = optionName;
                  break;
                }
              }
            }
          }
        }
        attributes = Object.entries(options).map(([title, value]) => ({ title, value }));
      }
      //Attributes starts here

      // Check if the product head exists and update it if it does or create a new one if it doesn't exist yet
      if ((['config-item', 'simple-item'].includes(row.type)) || (row.type == 'variant' && !parentDetails)) {
        if (parentDetails) {
          parentDetails = await productHeadService.update({ _id: parentDetails?._id }, headPayload)
        } else {
          parentDetails = await productHeadService.add(headPayload)
        }
      }

      console.log(parentDetails);

      if ((row.type == 'variant' || row.type == 'simple-item') && parentDetails) {
        const isChildExists = await service.getProductDetails({ parentId: ObjectId(parentDetails?._id) })
        const productSlug = (row?.name && productDetails?.name == row.name) ?
          productDetails?.slug :
          await slug.createSlug(db.Product, row.name, { slug: await slug.generateSlug(row.name) });

        const relatedProducts = row?.relatedProducts?.split(',') || [];
        const relatedProductDetails = await service.find({ sku: { $in: relatedProducts } });
        let relatedProductIds = relatedProductDetails.length > 0 ? relatedProductDetails?.map(product => product._id.toString()) : [];

        let payload = {
          name: row?.name ? row.name : productDetails?.name,
          slug: productSlug,
          parentId: parentDetails?._id,
          price: {
            mrp: row?.originalPrice ? row.originalPrice : productDetails?.price?.mrp,
            offer: row?.storePrice ? row.storePrice : productDetails?.price?.offer,
            selling: row?.storePrice ? row.storePrice : productDetails?.price?.selling,
            production: row?.productionPrice ? row.productionPrice : productDetails?.price?.production
          },
          relatedProducts: relatedProductIds,
          donationPercentage: row?.donationPercentage ? row.donationPercentage : productDetails?.donationPercentage,
          stock: row?.quantity ? row.quantity : productDetails?.stock,
          MOQ: 1,
          maxOrderQuantity: 10,
          sku: row?.sku ? row.sku : productDetails?.sku,
          overview: row?.excerpt ? row.excerpt : productDetails?.overview,
          category: categories,
          thumbnail: thumbnail,
          hoverThumbnail: thumbnail,
          isActive: (row?.active ? row?.active == '0' ? true : false : productDetails?.isActive) || true,
          isVisible: productDetails?.isVisible ? productDetails?.isVisible : isChildExists ? false : true,
          metaKeywords: row?.metaKeywords ? row.metaKeywords : productDetails?.metaKeywords,
          metaTitle: row?.metaName ? row.metaName : productDetails?.metaTitle,
          metaDescription: row?.metaDesc ? row.metaDesc : productDetails?.metaDescription,
          attributes: attributes,
          searchKeywords: row?.searchKeywords ? row?.searchKeywords.split(',') : productDetails?.searchKeywords,
          files: files,
          video: row?.video ? row.video : productDetails?.video,
          details: {
            description: row?.description ? row.description : productDetails?.details?.description,
            returnPolicy: row?.returnPolicy ? row.returnPolicy : productDetails?.details?.returnPolicy,
            sizeChart: row?.sizeChart ? row.sizeChart : productDetails?.details?.sizeChart
          },
        };

        if (row.parent_sku) {
          const parentDetails = await productHeadService.findOne({ sku: row.parent_sku });
          if (parentDetails) {
            payload.product = parentDetails?._id;
          }
        } else {
          payload.product = parentDetails?._id;
        }

        console.log(payload);

        if (productDetails) {
          await service.update({ sku: row?.sku }, payload);
          console.log(`Product SKU : ${row?.sku} ${counter} updated successfully`);
        } else {
          await service.create(payload);
          console.log(`Product SKU : ${row?.sku} ${counter} created successfully`);
        }

        console.log(`Product SKU : ${row?.sku} ${counter} processed successfully`);
      }

      release(); // Release the mutex
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

exports.updateBulkProducts = async (req, res) => {

}

function isUrl(string) {
  return string.includes('http') || string.includes('https');
}

exports.deleteProducts = async (req, res, next) => {
  const { products } = req.body;
  const response = await service.deleteMany({ sku: { $in: products } });
  if (response instanceof Error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  } else {
    helper.deliverResponse(res, 200, {}, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  }
}

exports.getActiveProduct = async (req, res, next) => {
  try {
    let product = await db.Product.find({
      isDelete: false,
      isActive: true,
    });
    helper.deliverResponse(res, 200, product);
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};