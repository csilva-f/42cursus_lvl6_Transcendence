//Function to iterate through elements with the data-i18n and updates the content
function updateContent(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = langData[key];
    });
}

//Sets the new language in the localStorage, then reloads the window
async function setLanguagePreference(lang) {
    
    location.reload();
}

//Function to get the language json file
async function getLanguageData(lang) {
    const response = await fetch(`/static/language/${lang}.json`);
    return response.json();
}

//Function called by the html that changes the language to the one clicked
async function changeLanguage(lang) {
    await UserInfo.updateUserLanguage(lang);
    localStorage.setItem('language', lang);
    const langData = await getLanguageData(lang);
    await UserInfo.updateUserExtension();
    updateContent(langData);
    insertPlaceholders(window.location.pathname, langData)
}

//Main function to get the language on the localStorage then get the respective json language file
window.addEventListener('DOMContentLoaded', async () => {
    const userLang = localStorage.getItem('language') || 'en';
    const langData = await getLanguageData(userLang);
    updateContent(langData);
});