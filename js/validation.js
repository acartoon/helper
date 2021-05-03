
/**
 * ������� ������������� ���������, �������� ����� � ��������� �������������
 * @param {formClass} ����� �����
 * @param {params} ��������� �������� �������
 *
 * */
function onInitForm(formClass, params) {
    var form = $(formClass);
    if (!form.length) return;

    var validate = validateForm(form);
    validate.init();

    form.on('click', 'button[type="submit"]', function (evt) {
        evt.preventDefault();
        validate.checkAllError();

        if(!validate.isSubmitForm()) return;

        var paramsAjax = {
            type: 'POST',
            url: params.url,
            dataType: 'json',
            data: form.serializeArray(),
            // ��� �������� �������
            onSuccess: function () {
                openSuccessFormPopup();
                form[0].reset();
                onOverflowMob();
            },
            onError: function () {
                openErrorFormPopup();
                form[0].reset();
                onOverflowMob();
            },
        }

        onSendAjax(paramsAjax);
    });
}


/*******
 *
 * ������� ��������� 2 ���������
 * form - �����
 * params - ������ � ����������� ��� ��������
 * ���� ������������ �� ��������� required � params.attr

 * ��� ���� ����������� �� �������� params.attr
 * ����� ������ ���� params.errorClass
 * ���� ��� ������ ������� params.attrError
 *
 * *******/
function validateForm(form) {
    var validate = {
        errorClass: 'form-input--error',
        input: null,
        attr: 'data-type',
        attrError: 'data-field-error',
        arrayInput: [],
        errors: {
            TEXT: '������� ���� ���',
            TEL: '������� ���������� �����',
            DEFAULT: '��������� ����',
            EMAIL: '�������� ������ �����',
        },
        form: form,
        isSubmitForm: function () {
            var that = this;
            var isValid = true;
            this.input.each(function () {
                var $this = $(this);
                isValid = isValid && that.isValidValue($this);
            });

            return isValid;
        },

        checkAllError: function() {
            var that = this;
            this.input.each(function () {
                var $this = $(this);
                var parent = $this.parent();
                that.checkError($this, parent);
            });
        },

        checkError: function(input, parent) {
            var typeData = input.attr(this.attr);

            switch (this.isValidValue(input)) {
                case true:
                    this.hideError(parent);
                    break;
                case false:
                    this.showError(parent, typeData);
            }
        },

        hideError: function (parent) {
            parent.removeClass(this.errorClass);
        },

        showError: function(parent, typeData) {
            var errorTextContainer = parent.find('[' + this.attrError + ']');
            var errorText;

            switch (typeData) {
                case dataType.TEL:
                    errorText = this.errors.TEL;
                    break;
                case dataType.TEXT:
                    errorText = this.errors.TEXT;
                    break
                case dataType.EMAIL:
                    errorText = this.errors.EMAIL;
                    break
            };
            errorTextContainer.text(errorText);
            parent.addClass(this.errorClass);
        },

        watch: function (input, parent) {
            var that = this;
            input.on('blur', function () {
                var value = $(this).val();
                if(value == '') return;
                that.checkError($(this), parent);
            });
            input.on('input', function () {
                that.hideError(parent);
            });
        },

        addMaskTel: function() {
            this.formTel = form.find('input[' + this.attr + '="tel"]').inputmask({
                mask: "8 (999) 999 99 99",
                placeholder: "_",
                showMaskOnHover: false
            });
        },

        addMaskEmail: function () {
            this.formEmail = form.find('input[' + this.attr + '="email"]');
            this.formEmail.inputmask('email', {
                placeholder: "",
            });
        },

        addResizeTextArea: function() {
            var textarea = form.find('[' + this.attr + '="textarea"]');
            autosize(textarea);
        },

        isValidEmail: function(address) {
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            return reg.test(address) == true;
        },

        isValidValue: function (input) {
            var value;
            var typeData = input.attr(this.attr);

            var isValid = false;
            switch (typeData) {
                case 'tel':
                    value = input.inputmask('unmaskedvalue');
                    isValid = (value.length == 10);
                    break;
                case 'text':
                    value = input.val();
                    isValid = (value !== '');
                    break;
                case 'email':
                    value = input.val();
                    isValid = this.isValidEmail(value);
                    break;
            };

            return isValid;

        },

        init: function () {
            var that = this;
            this.input = this.form.find('input['+ this.attr +'][required]');

            this.addMaskTel();
            this.addMaskEmail();
            this.addResizeTextArea();

            this.input.each(function () {
                var input = {};
                input.input = $(this);
                input.parent = $(this).parent();
                input.type = $(this).attr(that.attr);
                that.arrayInput.push(input);
                that.watch(input.input, input.parent);
            });
        }
    }

    return validate;
};


function onSendAjax(params) {
    $.ajax({
        type: params.type,
        url: params.url,
        dataType: params.url,
        data: params.data,
        processData: false,
        contentType: false,
        cache: false,
        success: function (data) {
            // ��� ���������� ����� ��������� ���� ������� �� complete
            //    params.onSuccess(data);
        },
        error: function (data) {
            // params.onError();
        },
        complete: function () {
            params.onSuccess();
        }
    });
}