const helper = require("../../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/category.service");
const slug = require("../../../../util/slug");
const db = require("../../../db");
const convertFile = require('../../../../util/base64tofile')
const fs = require("fs")
const productService = require("../../../services/product.service")
const adminService = require("../../../services/auth.service")
const csv = require('csv-parser');
const { BASE_URL } = require("../../../../config/constants/common");
const activity = require("../../../../util/activity.creator");
const fileImportService = require("../../../services/file.import.service");

const getAdminDetails = async (email) => {
  const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
  return details
}

exports.create = async (req, res) => {
  try {
    const { body } = req;
    const adminEmail = res?.locals?.user?.email
    const admin = await getAdminDetails(adminEmail)
    body.slug = await slug.createSlug(db.Category, body.name, { slug: await slug.generateSlug(body.name), });
    body.createdBy = admin?._id
    let response = await service.create(body);
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, response, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      })
    } else {
      helper.deliverResponse(res, 200, response, {
        error_code: messages.CATEGORY_SUCCESS.error_code,
        error_message: messages.CATEGORY_SUCCESS.error_message,
      });
    }
  } catch (error) {
    console.error('Error caught in create category API :: ' + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    })
  }
};
exports.getSubcategoriesByid = async (req, res) => {
  try {
    const { body } = req;
    const response = await service.getSubCategoriesById(body.categoryId);
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {     
    console.log("Error caught in get subcategory by id api :: " + error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};
exports.find = async (req, res) => {
  try {
    const response = await service.getCategory({ isDelete: false });
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in fetch categories api :: " + error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { body } = req
    const { type } = req?.query
    let query = { isDelete: false, isActive: true }

    switch (type) {
      case 'main':
        query['isRoot'] = true
        break
      case 'mega':
        query['isRoot'] = true
        query['isMegaMenu'] = true
        break
      case 'mega-sub':
        query['isRoot'] = true
        query['isMegaMenu'] = true
        query['parent.catid'] = body?.category
        break
      case 'sub':
        query['parent.catid'] = body?.category
        break
      case 'footer':
        query['isFooter'] = true
        break
    }

    const categories = await service.getCategories(query);
    helper.deliverResponse(res, 200, categories, {
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

exports.findCategory = async (req, res) => {
  try {
    const { body } = req
    let query = { isDelete: false, isActive: true }
    if (body?.keyword) query['name'] = { $regex: body?.keyword, $options: 'i' }
    const response = await service.getCategories(
      query, {}, { name: 1 }
    )
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
}

exports.getCategoriesForDropdown = async (req, res) => {
  try {
    const { page, type, keyword } = req?.query
    const limit = 40
    let activeDetails = true
    let query = { isDelete: false, isArchive: false, isActive: activeDetails }
    type == 'active' ? activeDetails = true : activeDetails = false
    keyword ? query.name = { $regex: keyword, $options: 'i' } : ''
    const categories = await service.getCategoriesForDropdown(query, page, limit, { name: 1, slug: 1, catid: 1 })
    helper.deliverResponse(res, 200, categories, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    console.log('Error caught in get categories api :: ' + error)
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.getDefaultCategories = async (req, res) => {
  try {
    const { category } = req.query
    const categoryDetails = await service.getSingleCategory({ slug: category })
    let defaultCategories = []
    defaultCategories.push({
      name: categoryDetails.name,
      catid: categoryDetails.catid,
      slug: categoryDetails.slug,
      _id: categoryDetails._id
    })
    const childCategories = await service.getCategories({
      $or: [{ root: categoryDetails._id }, { 'parent.refid': categoryDetails._id }]
    })
    if (childCategories.length > 0) {
      for (let childCategory of childCategories) {
        defaultCategories.push({
          name: childCategory.name,
          catid: childCategory.catid,
          slug: childCategory.slug,
          _id: childCategory._id
        })
      }
    }
    helper.deliverResponse(res, 200, defaultCategories, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    console.log('Error caught in get categories api :: ' + error)
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.getCategoryAttributes = async (req, res) => {
  try {
    const { category } = req.query
    const categoryDetails = await service.getSingleCategory({ slug: category })


  } catch (error) {
    console.log('Error caught in get category attributes api :: ' + error)
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}


exports.getCategoryByPage = async (req, res) => {
  try {
    const { page, limit } = req.query
    const category = await service.getCategoryByPage(page, limit);
    helper.deliverResponse(res, 200, category);
  } catch (error) {
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getActiveCategory = async (req, res) => {
  try {
    const category = await service.getCategory({ isActive: true, isDelete: false });
    helper.deliverResponse(res, 200, category);
  } catch (error) {
    helper.deliverResponse(res, 200, {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await service.getCategoryById(id);
    helper.deliverResponse(res, 200, category);
  } catch (error) {
    helper.deliverResponse(res, 200, {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.findOne = async (req, res) => {
  try {
    const response = await service.findOne({ _id: req.params.categoryId });
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in category details api :: " + error)
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.changeCategoryStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
    let { status } = req.body;
    if (!status) status = false;
    let { id } = req.params;

    let category = await service.update(id, {
      isActive: status,
    });
    helper.deliverResponse(res, 200, category);
  } catch (error) {
    helper.deliverResponse(res, 200, {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.search = async (req, res, next) => {
  try {
    const { resultType } = req.query
    const { body } = req
    let query = { isDelete: false }

    if (body.keyword) {
      query['name'] = { $regex: body.keyword, $options: 'i' }
    }

    if (body.isActive) {
      query['isActive'] = body.isActive
    }

    if (body.isRoot) {
      query['isRoot'] = body.isRoot
    }

    console.log(query);

    let response = await service.search(query, body.page, body.limit)
    helper.deliverResponse(res, 200, response, messages.successResponse);
  } catch (error) {
    console.log("Error caught in search category API :: " + error);
    helper.deliverResponse(res, 422, {}, messages.serverError);
  }
}
exports.searchSubcategories = async (req, res, next) => {
  try {
    const { resultType } = req.query
    const { body } = req

    let query = { isDelete: false }

    // Search by keyword in name
    if (body.keyword) {
      query['name'] = { $regex: body.keyword, $options: 'i' }
    }

    // Filter by active status
    if (body.isActive) {
      query['isActive'] = body.isActive
    }

    // Filter by category ID
    if (body.categoryId) {
      query['categoryId'] = body.categoryId
    }

    // Additional filters specific to subcategories
    if (body.sortOrder) {
      query['sortOrder'] = body.sortOrder
    }

    if (body.displayOnHome !== undefined) {
      query['displayOnHome'] = body.displayOnHome
    }

    console.log("Subcategory search query:", query);

    let response = await service.search(query, body.page, body.limit)
    console.log("Subcategory search response:", response.data);
    helper.deliverResponse(res, 200, response, messages.successResponse);
  } catch (error) {
    console.log("Error caught in search subcategories API :: " + error);
    helper.deliverResponse(res, 422, {}, messages.serverError);
  }
}
exports.update = async (req, res, next) => {
  try {
    const { body } = req;
    const categoryDetails = await service.findOne({ slug: body.slug })
    body.name == categoryDetails.name ? null : body.slug = await slug.createSlug(db.Category, body?.name, { slug: await slug.generateSlug(body?.name) })

    const inActiveOrArchived = body.isArchive == "true" || body.isActive == "false"

    if (inActiveOrArchived) {
      const [
        productExists,
        childrenExists
      ] = await Promise.all([
        db.Product.find({ 'category': { $in: [categoryDetails._id] } }),
        db.Category.find({ $or: [{ root: categoryDetails._id }, { 'parent': categoryDetails._id }] })
      ])

      if (productExists && productExists.length > 0 || childrenExists && childrenExists > 0) {
        return helper.deliverResponse(res, 200, {}, messages.CATEGORY_NOT_DELETE);
      }
    }

    let response = await service.update({ _id: body._id }, body)
    if (response instanceof Error) {
      return helper.deliverResponse(res, 422, response, messages.serverError);
    }

    helper.deliverResponse(res, 200, response, messages.CATEGORY_UPDATE);
  } catch (error) {
    console.error('Error caught in update category API :: ' + error);
    helper.deliverResponse(res, 422, error, messages.serverError);
  }
};

exports.deleteOne = async (req, res) => {
  try {
    let response = await service.update({ _id: req.params.categoryId }, { isDelete: true })
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, response, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    } else {
      activity.logActivity(res.locals.user.email, 'Category deleted');
      helper.deliverResponse(res, 200, response, {
        "error_code": messages.CATEGORY_DELETE.error_code,
        "error_message": messages.CATEGORY_DELETE.error_message
      });
    }
  } catch (error) {
    console.log("Error caught in delete category API :: " + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params
    let response = await service.update({ _id: id }, { isArchive: false })
    if (response instanceof Error) {
      helper.deliverResponse(res, 422, response, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    } else {
      activity.logActivity(res.locals.user.email, 'Category restored');
      helper.deliverResponse(res, 200, response, {
        "error_code": messages.CATEGORY_UPDATE.error_code,
        "error_message": messages.CATEGORY_UPDATE.error_message
      });
    }
  } catch (error) {
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.getMainCategories = async (req, res, next) => {
  try {
    let response = await service.getCategories({
      isDelete: false,
      isActive: true,
      isRoot: true
    });
    helper.deliverResponse(res, 200, response, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    console.log("Error caught in main category :: " + error);
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getSubCategories = async (req, res, next) => {
  try {
    let { body } = req
    body.isDelete = false
    let category = await service.getCategories(body);
    helper.deliverResponse(res, 200, category, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    }
    );
  }
};

exports.getAllSubcategories = async (req, res, next) => {
  try {
    const query = { isRoot: false, isDelete: false, isActive: true, isArchive: false }
    let category = await service.getCategories(query);
    helper.deliverResponse(res, 200, category, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    }
    );
  }
}

exports.archivedCategories = async (req, res, next) => {
  try {
    const { page } = req.query
    const { body } = req
    let query = { isArchive: true, isDelete: false }
    if (body?.name) query["name"] = { $regex: body["name"], $options: 'i' }
    let category = await service.getCategoryBySearch(query, page)
    helper.deliverResponse(res, 200, category, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.updateArchivedCategory = async (req, res, next) => {
  try {
    const { body } = req
    let category = await service.updateCategoryById(body, { isArchive: false })
    helper.deliverResponse(res, 200, category, {
      "error_code": messages.CATEGORY_UPDATE.error_code,
      "error_message": messages.CATEGORY_UPDATE.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.getSubcategoriesByCatid = async (req, res, next) => {
  try {
    const { body } = req
    let data = []
    const projection = { _id: 1, catid: 1, name: 1, slug: 1, file: 1, isMegaMenu: 1 }
    for (let _id of body) {
      const refid = await service.getCategories({ _id: _id })
      const query = { $or: [{ "parent.catid": { $in: refid[0]?.catid } }, { root: { $in: _id } }], isActive: true, isArchive: false }
      let category = await service.getCategories(query, projection);
      for (let res of category) {
        data.push(res)
      }
    }
    helper.deliverResponse(res, 200, data, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    console.error('Error caught :: ' + error);
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.getChildCategories = async (req, res) => {
  try {
    const { body } = req
    let query = {
      $or: [{ root: { $in: body?.categories } }, { 'parent.refid': { $in: body?.categories } }, { _id: { $in: body?.categories } }],
      isActive: true, isArchive: false, isDelete: false
    }

    let categoryDetails = []
    body?.categories.length > 0 ? categoryDetails = await service.getCategories(query, { name: 1, slug: 1, catid: 1 }) : null
    helper.deliverResponse(res, 200, categoryDetails, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    console.error('Error caught in get child categories API :: ' + error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.updateMedia = async (req, res, next) => {
  try {
    const { type } = req.params
    const { body } = req
    let path = ''

    if (!body.url) {
      const filepath = await convertFile(body?.media?.url, body?.media?.name, "category")
      path = 'uploads' + filepath
    } else {
      path = body.url
    }

    let payload = {}
    type == 'cover' ? payload['banner'] = path : payload['file'] = path
    const responseDetails = await service.updateCategoryById({ catid: body?.category }, payload)
    if (responseDetails instanceof Error) {
      helper.deliverResponse(res, 422, responseDetails, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      helper.deliverResponse(res, 200, {}, {
        "error_code": messages.CATEGORY_UPDATE.error_code,
        "error_message": messages.CATEGORY_UPDATE.error_message
      });
    }
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.removeCoverImage = async (req, res, next) => {
  try {
    const { category } = req.params
    const categoryDetails = await service.updateCategoryById({ catid: category }, { banner: null })
    if (categoryDetails instanceof Error) {
      helper.deliverResponse(res, 422, categoryDetails, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      helper.deliverResponse(res, 200, {}, {
        "error_code": messages.CATEGORY_UPDATE.error_code,
        "error_message": messages.CATEGORY_UPDATE.error_message
      });
    }
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.categoryImages = async (req, res, next) => {
  try {
    const categories = await service.getCategories({})
    let images = []
    for (let category of categories) if (!images.includes(category?.file)) images.push(category?.file)
    let response = { images: images }
    helper.deliverResponse(res, 200, response, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 200, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.bulkMediaUpload = async (req, res, next) => {
  try {
    helper.deliverResponse(res, 200, { count: req?.files?.path }, {
      "error_code": messages.CATEGORY_BULK_SUCCESS.error_code,
      "error_message": messages.CATEGORY_BULK_SUCCESS.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.bulkFileUpload = async (req, res, next) => {
  try {
    const rootDir = process.cwd();
    const startTime = performance.now();
    const file = rootDir + "/" + req?.file?.path
    const { email } = res?.locals?.user
    const adminDetails = await getAdminDetails(email)

    const fileDetails = await fileImportService.create({
      title: req?.file?.originalname, createdBy: adminDetails?._id,
      slug: await slug.createSlug(db.FileImport, req?.file?.originalname, { slug: await slug.generateSlug(req?.file?.originalname) }),
      status: 'awaiting', type: 'categories',
    })

    if (fileDetails instanceof Error) {
      helper.deliverResponse(res, 422, {}, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      let counter = 0;
      const processPromises = [];
      let processFailed = false;

      await new Promise((resolve, reject) => {
        fs.createReadStream(file).pipe(csv()).on('data', async (row) => {
          if (processFailed) return;
          counter++;
          const processPromise = processRow(row, counter);
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
        const fileAfterSuccess = await fileImportService.update({ _id: fileDetails._id }, {
          status: 'completed',
          executionTime: executionTime,
          dataImported: counter
        });

        if (fileAfterSuccess instanceof Error) {
          helper.deliverResponse(res, 422, fileAfterSuccess, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
          });
        } else {
          await activity.logActivity(email, 'Categories (csv) uploaded');
          helper.deliverResponse(res, 200, { total: counter }, {
            "error_code": 0,
            "error_message": counter + " categories uploaded successfully"
          });
        }
      } else {
        const fileAfterFailure = await fileImportService.update(
          { _id: fileDetails._id }, {
          status: 'failed',
        });

        if (fileAfterFailure instanceof Error) {
          helper.deliverResponse(res, 422, fileAfterFailure, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
          });
        } else {
          helper.deliverResponse(res, 200, { total: counter }, {
            "error_code": 1,
            "error_message": "Failed to upload the csv file."
          });
        }
      }

    }
  } catch (error) {
    console.log("Error caught in bulk import category :: " + error);
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

function processRow(row, counter) {
  return new Promise(async (resolve, reject) => {
    const details = await db.Category.findOne({ name: row?.NAME, isDelete: false })
    const assetDetails = await db.Media.findOne({ title: row.IMAGE })
    let payload = {
      name: row.NAME,
      thumbnail: assetDetails?._id,
      isRoot: row.ROOT == '0' ? true : false,
      isActive: row.ACTIVE == '0' ? true : false,
      isFeatured: row.FEATURED == '0' ? true : false,
      slug: details?.name != row?.NAME ? await slug.createSlug(db.Brand, row.NAME, { slug: await slug.generateSlug(row.NAME) }) : details?.slug,
      catid: !details ? counter + 1 : details?.catid,
      style: {
        text: { color: '#000000', fontSize: 14, fontWeight: 400 },
        background: '#FFFFFF',
        border: '#E6E6E6',
        radius: 10
      }
    }

    if (row.ROOT == '1') {
      const parentDetails = await db.Category.findOne({ name: row?.PARENT, isDelete: false })
      if (parentDetails) {
        payload["parent"] = { refid: parentDetails?._id, catid: parentDetails?.catid }
        if (parentDetails.isRoot == true) {
          payload['root'] = parentDetails?._id
          payload['path'] = parentDetails?.name
        } else {
          payload['root'] = String(parentDetails?.root)
          const rootDetails = await db.Category.findOne({ _id: String(parentDetails?.root) })
          payload['path'] = rootDetails?.name + " > " + parentDetails?.name
        }
        details ? await service.updateCategoryById({ name: row?.NAME }, payload) : await service.create(payload)
      }
    } else {
      details ? await service.updateCategoryById({ name: row?.NAME }, payload) : await service.create(payload)
    }
    resolve();
  });
}

exports.manageCategoryLanding = async (req, res) => {
  try {
    const { body } = req
    const adminEmail = res?.locals?.user?.email
    const admin = await getAdminDetails(adminEmail)
    body.createdBy = admin?._id || null

    const categoryLandingExists = await service.getCategoryLanding({ isDelete: false, category: body?.category })

    if (categoryLandingExists) {
      const response = await service.updateCategoryLanding({ _id: categoryLandingExists._id }, body)
      
      // Check if body.isActive is true, set isLanding accordingly
      const isLanding = body?.isActive === true ? true : false
      
      await service.updateCategoryById(
        { _id: body?.category }, 
        { isLanding: isLanding }
      )
      
      helper.deliverResponse(res, 200, response, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
      });
    }else {
      const response = await service.createCategoryLanding(body);
      await service.updateCategoryById({ _id: body?.category }, { isLanding: true })
      helper.deliverResponse(res, 200, response, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
      });
    }
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}

exports.getCategoryLanding = async (req, res) => {
  try {
    const { body } = req
    const categoryLanding = await service.getCategoryLanding({
      isDelete: false, category: body?.
        categoryId
    })
    helper.deliverResponse(res, 200, categoryLanding, {
      "error_code": messages.successResponse.error_code,
      "error_message": messages.successResponse.error_message
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
}
