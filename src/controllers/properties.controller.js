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

const getRegional = async (req, res) => {
  try {
    const data = await propertiesService.getRegional();

    const transformedData = data.map((item) => item.regional);
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

const getGroup = async (req, res) => {
  try {
    const data = await propertiesService.getGroup();

    const transformedData = data.map((item) => item.group);
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

const getLocationDescription = async (req, res) => {
  try {
    const data = await propertiesService.getLocationDescription();

    const transformedData = data.map((item) => item.location_description);
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

const getDirectoratDescription = async (req, res) => {
  try {
    const data = await propertiesService.getDirectoratDescription();

    const transformedData = data.map((item) => item.directorat_description);
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

const getDivisionDescription = async (req, res) => {
  try {
    const data = await propertiesService.getDivisionDescription();

    const transformedData = data.map((item) => item.division_description);
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

const getStatus = async (req, res) => {
  try {
    const data = await propertiesService.getStatus();

    const transformedData = data.map((item) => item.status);
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

module.exports = { getBusinessUnit, getRegional, getGroup, getLocationDescription, getDirectoratDescription, getDivisionDescription, getStatus }