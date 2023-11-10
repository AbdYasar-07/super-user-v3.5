import axios from "axios";
import Axios from "../../Utils/Axios";

export const roleFilter = (data, condition) => {
  if (data?.length > 0) {
    data = data?.filter((ele) => ele?.name?.includes(condition));
  }
  return data;
};
export const groupFilter = (data, condition) => {
  if (data?.length > 0) {
    data = data?.filter((ele) => ele?.name?.includes(condition));
  }
  return data;
};
export const toMapApplicationNames = (data, clientsinfo) => {
  data?.forEach((ele, index) => {
    let foundedValue = clientsinfo?.find(
      (clientsData) => clientsData?.client_id === ele?.applicationId
    );
    if (foundedValue) {
      data[index]["applicationName"] = foundedValue?.name;
    }
  });
  if (data.length > 0) {
    return data;
  }
};

export const getOSCIDByBPCode = async (bpCode) => {
  const body = JSON.stringify({
    id: 107164,
    filters: [
      {
        name: "SAP BP Code",
        values: `${bpCode}`,
      },
    ],
  });
  const url = "https://service-staging.carrier.com.ph/services/rest/connect/v1.4/analyticsReportResults";
  const response = await Axios(url, "POST", body, null, false, true);
  if (!axios.isAxiosError(response)) {
    return response;
  } else {
    console.error("Error :::", response.cause);
  }
};
