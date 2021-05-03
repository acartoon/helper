/**
 * плавный скролл до блока
 * принимает id блока до которого нужен скролл
 * */
function scrollTo(id) {

    var block = $('#' + id);
    var scrollTop = block.offset().top;

    $('html, body').animate({
        scrollTop: scrollTop
    }, 500);
}