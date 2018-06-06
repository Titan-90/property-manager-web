const mongoose = require('mongoose');
const Tenant = require('../models/tenant');

const getAggreateMatchedIds = result => {
  let ids = [];
  for (let i = 0; i < result.length; i++) {
    ids.push(result[i]._id);
  }
  return ids;
};
const getSearchReg = search => {
  var terms = search.split(' ');

  var regexString = '';

  for (var i = 0; i < terms.length; i++) {
    regexString += terms[i];
    if (i < terms.length - 1) regexString += '|';
  }

  return new RegExp(regexString, 'ig');
};
exports.search = async function(req, res) {
  const { text } = req.body;
  const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
  let limit = req.query._limit ? parseInt(req.query._limit, 10) : 20;

  console.log('offset', offset);
  console.log('limit', limit);
  console.log('text', text);

  if (limit > 50) limit = 50;

  try {
    const tenants = await Tenant.find(
      { $text: { $search: text }},
    );
    res.json(tenants);
  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error: ${error}`
    });
  }
  // const cursor = Tenant.find(filter)
  //   .sort({
  //     createdAt: -1
  //   })
  //   .skip(offset)
  //   .limit(limit);

  // ensures that the effects of skip() and limit() will be ignored
  // cursor
  //   .exec()
  //   .then(tenant => {
  //     Tenant.count().then(totalCount => {
  //       res.json({
  //         metadata: {
  //           totalCount
  //         },
  //         records: tenant
  //       });
  //     });
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     res.status(500).json({
  //       message: `Internal Server Error: ${error}`
  //     });
  //   });
};
exports.list = async function(req, res) {
  try {
    const Tenants = await Tenant.find({});
    console.log(Tenants);
    res.json(Tenants);
  } catch (err) {
    res.status(500).json({
      message: `Internal Server Error: ${err}`
    });
  }
};
// TODO: should implement range pagination instead of using skip to result in better server performance
// exports.list = async function(req, res, next) {
//   const filter = {};
//   if (req.query.status) filter.status = req.query.status;
//   if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
//   if (req.query.effort_lte)
//     filter.effort.$lte = parseInt(req.query.effort_lte, 10);
//   if (req.query.effort_gte)
//     filter.effort.$gte = parseInt(req.query.effort_gte, 10);

//   if (req.query._summary === undefined) {
//     if (req.query.search) {
//       Tenant.aggregate()
//         .project({
//           fullName: {
//             $concat: ['$name.firstName', ' ', '$name.lastName']
//           }
//         })
//         .match({
//           fullName: new RegExp(req.query.search, 'ig')
//         })
//         .exec()
//         .then(results => {
//           console.log('results', getSearchReg(req.query.search));
//           const ids = getAggreateMatchedIds(results);
//           if (ids.length > 0)
//             filter._id = {
//               $in: ids
//             };
//           search(req, res, filter);
//         });
//     } else search(req, res, filter);
//   } else {
//     Tenant.aggregate([
//       {
//         $match: filter
//       },
//       {
//         $group: {
//           _id: {
//             name: '$owner',
//             createdAt: '$createdAt'
//           },
//           count: {
//             $sum: 1
//           }
//         }
//       }
//     ])
//       .exec()
//       .then(results => {
//         const stats = {};
//         results.forEach(result => {
//           if (!stats[result._id.owner]) stats[result._id.owner] = {};
//           stats[result._id.owner][result._id.status] = result.count;
//         });
//         res.json(stats);
//       })
//       .catch(error => {
//         console.log(error);
//         next(error);
//         res.status(500).json({
//           message: `Internal Server Error: ${error}`
//         });
//       });
//   }
// };

exports.create = async function(req, res) {
  const req_tenant = req.body;
  req_tenant.created = new Date();
  if (!req_tenant.status) {
    req_tenant.status = 'New';
  }
  try {
    const newTenant = new Tenant(newTenant);
    const Tenant = await newTenant.save();
    res.json(Tenant);
    return Tenant;
  } catch (err) {
    res.status(500).json({
      message: `Internal Server Error: ${err}`
    });
  }
  // var newTenant = new Tenant(newTenant);
  // newTenant.save().then(savedTenant => {
  //   res.json(savedTenant);
  // }).catch(error => {
  //   console.log(error);
  //   res.status(500).json({
  //     message: `Internal Server Error: ${error}`
  //   });
  // });
};

exports.delete = async function(req, res) {
  let { docIds } = req.body;
  try {
    docIds = docIds.map(id => mongoose.Types.ObjectId(id));
  } catch (error) {
    res.status(422).json({
      message: `Invalid issue ID format: ${error}`
    });
    return;
  }

  try {
    const deleteResult = await Tenant.deleteMany({
      _id: {
        $in: docIds
      }
    });
    if (deleteResult.result.n === docIds.length) {
      return res.json({
        status: 'OK'
      });
    } else {
      return res.json({
        status: 'Warning: object not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error: ${error}`
    });
  }
  // Tenant.deleteMany({
  //   _id: {
  //     $in: docIds
  //   }
  // })
  //   .then(deleteResult => {
  //     console.log('deleteResult', deleteResult.result);
  //     if (deleteResult.result.n === docIds.length)
  //       res.json({
  //         status: 'OK'
  //       });
  //     else
  //       res.json({
  //         status: 'Warning: object not found'
  //       });
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     res.status(500).json({
  //       message: `Internal Server Error: ${error}`
  //     });
  //   });
};

// Get tenant detail
exports.read = async function(req, res) {
  let documentId;
  try {
    documentId = mongoose.Types.ObjectId(req.params.id);
  } catch (error) {
    return res.status(422).json({
      message: `Invalid issue ID format: ${error}`
    });
  }

  try {
    const tenant = await Tenant.findOne({
      _id: documentId
    });
    if (tenant) {
      return res.status(404).json({
        message: `No such tenant: ${documentId}`
      });
    } else {
      return res.json(tenant);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Internal Server Error: ${error}`
    });
  }
  // Tenant.findOne({
  //   _id: documentId
  // })
  //   .then(tenant => {
  //     if (!tenant)
  //       res.status(404).json({
  //         message: `No such tenant: ${documentId}`
  //       });
  //     else res.json(tenant);
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     res.status(500).json({
  //       message: `Internal Server Error: ${error}`
  //     });
  //   });
};

// update tenant
exports.update = function(req, res) {
  let _id;
  try {
    _id = mongoose.Types.ObjectId(req.params.id);
  } catch (error) {
    return res.status(422).json({
      message: `Invalid issue ID format: ${error}`
    });
  }

  const tenant = req.body;
  tenant.updatedAt = new Date();

  try {
    const tenant = Tenant.findOneAndUpdate(
      {
        _id: _id
      },
      {
        $set: tenant
      },
      {
        new: true
      }
    );
    res.json(tenant);
  } catch (error) {
    return res.status(500).json({
      message: `Internal Server Error: ${error}`
    });
  }

  // Tenant.findOneAndUpdate(
  //   {
  //     _id: _id
  //   },
  //   {
  //     $set: tenant
  //   },
  //   {
  //     new: true
  //   },
  //   function(err, updatedTenant) {
  //     if (err) return handleError(err, res);
  //     res.json(updatedTenant);
  //   }
  // );
};

// delete tenant
exports.delete = function(req, res) {
  let docId;
  try {
    docId = mongoose.Types.ObjectId(req.params.id);
  } catch (error) {
    return res.status(422).json({
      message: `Invalid issue ID format: ${error}`
    });
  }
  Tenant.deleteOne({
    _id: docId
  })
    .then(deleteResult => {
      if (deleteResult.result.n === 1)
        res.json({
          status: 'OK'
        });
      else
        res.json({
          status: 'Warning: object not found'
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: `Internal Server Error: ${error}`
      });
    });
};
