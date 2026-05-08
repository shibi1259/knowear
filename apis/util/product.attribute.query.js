exports.attributesQuery = [
    {
        $group: {
            _id: "$attribute",
            values: {
                $push: "$value"
            }
        }
    },
    {
        $project: {
            _id: 0,
            attributeId: "$_id",
            values: 1
        }
    },
    {
        $graphLookup: {
            from: "attributes.heads",
            startWith: "$attributeId",
            connectFromField: "attributeId",
            connectToField: "_id",
            as: "attribuetIdDetails"
        }
    },
    {
        $unwind: {
            path: "$values",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $graphLookup: {
            from: "attributes.values",
            startWith: "$values",
            connectFromField: "values",
            connectToField: "_id",
            as: "relatedValues"
        }
    },
    {
        $group: {
            _id: "$attribuetIdDetails",
            values: {
                $push: "$relatedValues"
            }
        }
    },
    {
        $addFields: {
            attributeId: { $arrayElemAt: ["$_id", 0] },
            values: {
                $reduce: {
                    input: "$values",
                    initialValue: [],
                    in: {
                        $concatArrays: ["$$value", "$$this"]
                    }
                }
            }
        }
    },
    {
        $addFields: {
            attributeId: {
                $cond: {
                    if: { $eq: ["$attributeId", null] },
                    then: {},
                    else: {
                        name: "$attributeId.name",
                        _id: "$attributeId._id",
                        type: "$attributeId.type"
                    }
                }
            },
            values: {
                $map: {
                    input: "$values",
                    as: "value",
                    in: {
                        $cond: {
                            if: { $eq: ["$$value", null] },
                            then: {},
                            else: {
                                value: "$$value.value",
                                _id: "$$value._id"
                            }
                        }
                    }
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            attributeId: 1,
            values: 1
        }
    }
]