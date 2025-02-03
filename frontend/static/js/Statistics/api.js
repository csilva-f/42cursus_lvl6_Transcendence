//? GET - /api/get-userstatistics/?userID=
async function fetchStatistics() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);

  const APIurl = `/api/get-userstatistics/?userID=${1}`
  $.ajax({
    type: "GET",
    url: APIurl,
    contentType: "application/json",
    headers: { Accept: "application/json" },
    success: function (res) {
      console.log(res.users)
      createChart(res.users);
      updateContent(langData);
    },
    error: function (xhr, status, error) {
      console.error("Error Thrown:", error);
      showErrorToast(APIurl, error, langData);
    },
  });
}