jQuery.fn._toggle = function() {
    var st = this.css('display');
    var target = this;
    if(st == 'none') {
        this.css('display', 'block');
        var height = 0;
        this.children().each(function () {
            height += $(this).outerHeight(true);
        });

        this.height(0);
        this.animate({
            height: height,
        }, 400, function () {
            target.css('height', '');
            target.css('display', '');
        })
    } else {
        this.css('overflow', 'hidden');
        this.css('display', 'block');
        this.animate({
            height: 0,
        }, 400, function () {
            target.css('overflow', '');
            target.css('display', '');
            target.css('height', '');
        })

    }
}