import apiClient from "../apiClient";

export const pincodeApi = {
  validate: (pincode: string) =>
    apiClient.get("/pincode/validate", { params: { pincode } }).then((r) => r.data),

  getServiceable: () => apiClient.get("/pincode/serviceable").then((r) => r.data),
};
