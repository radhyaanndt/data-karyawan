const propertiesService = require ("../services/properties-service")

const getBusinessUnit = async (req, res) => {
  try {
    const data = await propertiesService.getBusinessUnit();
    const transformedData = data.map((item) => item.business_unit_description);
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }
    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData  ,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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

const getPositionDescription = async (req, res) => {
  try {
    const data = await propertiesService.getPositionDescription();
    const transformedData = data.map((item) => item.position_description);
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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

const getStatusPlanFulfillment = async (req, res) => {
  try {
    const data = await propertiesService.getStatusPlanFulfillment();
    const transformedData = data.map((item) => item.status_plan_fulfillment);
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }
    
    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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

const getPlanFulfillment = async (req, res) => {
  try {
    const data = await propertiesService.getPlanFulfillment();
    const transformedData = data.map((item) => item.plan_fulfillment);
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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

const getDetailPlanFulfillment = async (req, res) => {
  try {
    const data = await propertiesService.getDetailPlanFulfillment();
    const transformedData = data.map((item) => item.detail_plan_fulfillment);
    const uniqueData = Array.from(new Set(transformedData));

    const indexEmptyString = uniqueData.indexOf("");
    if (indexEmptyString !== -1) {
      uniqueData.splice(indexEmptyString, 1);
      uniqueData.push("");
    }

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: uniqueData,
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

module.exports = { getBusinessUnit, getRegional, getGroup, getLocationDescription, getDirectoratDescription, getDivisionDescription, getStatus, getPositionDescription, getStatusPlanFulfillment, getPlanFulfillment, getDetailPlanFulfillment }