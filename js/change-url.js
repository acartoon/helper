//изменяет url не перезагружая страницу
function changeUrl(link) {
    history.pushState(null, null, link);
}

function closestLink(string) {
    var href = window.loaction.href;

    if(href.indexOf(string) != -1) return true;
    return false
}
