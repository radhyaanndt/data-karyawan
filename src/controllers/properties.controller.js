const propertiesService = require ("../services/properties-service")

const getBusinessUnit = async (req, res) => {
  try {
    const data = await propertiesService.getBusinessUnit();

    const transformedData = data.map((item) => item.business_unit_description);
    return res.status(200).send({
      status: 200,
      message: "OK",
      data: transformedData,
    });
  } catch (error) {
    if (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

module.exports = { getBusinessUnit }