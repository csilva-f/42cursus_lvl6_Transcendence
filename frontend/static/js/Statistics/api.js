var userStats = [];

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
      userStats = res.users[0];
      updateContent(langData);
      createChart(userStats, 1)
    },
    error: function (xhr, status, error) {
      console.error("Error Thrown:", error);
      showErrorToast(APIurl, error, langData);
    },
  });
}