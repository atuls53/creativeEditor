(function ($) {
  if (typeof $.fn.creativeEditor === 'undefined') {
    // define default options
    var defaults = {
      content_css_url: 'css/creativeEditor.css',
      height: 250
    };
    $.fn.creativeEditor = function (options) {
      /*$.fn.creativeEditor.html = function (iframe) {
          return iframe.contentWindow.document.getElementsByTagName('body')[0].innerHTML;
      };
*/
      // build main options before element iteration
      var opts = $.extend(defaults, options);

      // iterate and construct the rich text editors
      return this.each(function () {
        var element = $(this),
            iframe;
        var element_id = element.prop('id');

        // enable design mode
        function enableDesignMode() {
          var content = element.val();

          // Mozilla needs this to display caret
          if ($.trim(content) === '') {
            content = '';
          }

          // already created? show/hide
          if (iframe) {
            element.hide();
            $(iframe).contents().find('body').html(content);
            $(iframe).show();
            $('#toolbar-' + element_id).remove();
            element.before(toolbar());
            return true;
          }

          // for compatibility reasons, need to be created this way
          iframe = document.createElement('iframe');
          iframe.frameBorder = 0;
          iframe.frameMargin = 0;
          iframe.framePadding = 0;
          iframe.height = opts.height;

          if (element.prop('class')) {
            iframe.className = element.prop('class');
          }
          if (element.prop('id')) {
            iframe.id = element_id;
          }
          if (element.prop('name')) {
            iframe.title = element.prop('name');
          }

          element.after(iframe);

          var css = '';
          if (opts.content_css_url) {
            css = "<link rel='stylesheet' href='" + opts.content_css_url + "'>";
          }

          var doc = '<!doctype html><html><head>' + css + '</head><body class="frameBody">' + content + '</body></html>';
          tryEnableDesignMode(doc, function () {
            $('#toolbar-' + element_id).remove();
            element.before(toolbar());
            // hide element
            element.hide();
          });
        }

        function tryEnableDesignMode(doc, callback) {
          if (!iframe) {
            return false;
          }

          iframe.contentWindow.document.open();
          iframe.contentWindow.document.write(doc);
          iframe.contentWindow.document.close();

          if (document.contentEditable) {
            iframe.contentWindow.document.designMode = 'On';
            callback();
            return true;
          } else if (document.designMode !== null) {
            iframe.contentWindow.document.designMode = 'on';
            callback();
            return true;
          }
          setTimeout(function () {
            tryEnableDesignMode(doc, callback);
          }, 500);

          return false;
        }

        function disableDesignMode(submit) {
          var content = $(iframe).contents().find('body').html();

          if ($(iframe).is(':visible')) {
            element.val(content);
          }

          if (submit !== true) {
            element.show();
            $(iframe).hide();
          }
        }

        // create toolbar and bind events to its elements
        function toolbar() {
          var tb = $("\
						<div class='editor-buttons' id='toolbar-" + element_id + "'>\
                          <span><select class='fontSize form-control input-sm'>\
                          <option value='2'>12</option>\
                          <option value='3'>14</option>\
                          <option value='4'>16</option>\
                          <option value='5'>18</option>\
                          </select></span>\
							<a href='#' class='bold btn btn-primary'><i class='fa fa-bold'></i></a>\
							<a href='#' class='italic btn btn-primary'><i class='fa fa-italic'></i></a>\
							<a href='#' class='strikeThrough btn btn-primary'><i class='fa fa-strikethrough'></i></a>\
							<a href='#' class='unorderedlist btn btn-primary'><i class='fa fa-list-ul'></i></a>\
						</div>\
					");

          $('.bold', tb).click(function () {
            formatText('bold');
            return false;
          });
          $('.italic', tb).click(function () {
            formatText('italic');
            return false;
          });

          $('.strikeThrough', tb).click(function () {
            formatText('strikeThrough');
            return false;
          });

          $('.unorderedlist', tb).click(function () {
            formatText('insertunorderedlist');
            return false;
          });
          $('.orderedlist', tb).click(function () {
            formatText('insertorderedlist');
            return false;
          });


          $('.fontSize', tb).on('change', function () {
            console.log(this.value);
            formatText('fontsize', this.value);
          });


          $(iframe).parents('form').submit(function () {
            disableDesignMode(true);
          });

          return tb;
        }


        function formatText(command, option) {
          iframe.contentWindow.document.execCommand(command, false, option);

          // convert nasty markup to light xhtml
          var markup = iframe.contentWindow.document.body.innerHTML;


          markup = markup.replace(/<span\s*(class="Apple-style-span")?\s*style="font-weight:\s*bold;">([^<]*)<\/span>/ig, '<strong>$2</strong>');
          markup = markup.replace(/<span\s*(class="Apple-style-span")?\s*style="font-style:\s*italic;">([^<]*)<\/span>/ig, '<em>$2</em>');

          iframe.contentWindow.document.body.innerHTML = markup;
          iframe.contentWindow.focus();
        }

        enableDesignMode();


        $("#editorform").submit(function (event) {
          event.preventDefault();
          disableDesignMode(true);
        });

        $("#submitForm").click(function (e) {
          e.preventDefault();
          $("#editorform").submit();
          $(".editor-buttons").before('<div class="alert alert-dismissable alert-success">Conteht saved successfully <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>  </div>');
          setTimeout(function () {
            $('.alert').fadeOut('slow');
          }, 4000);
          localStorage.setItem("formData", iframe.contentWindow.document.body.innerHTML);
          iframe.contentWindow.document.designMode = 'Off';
          $(iframe).addClass("disable");
          $(iframe.contentWindow.document.body).addClass("disable");
        });


        $(iframe.contentWindow).on('click', function () {
          $(iframe).removeClass("disable");
          $(iframe.contentWindow.document.body).removeClass("disable");
          iframe.contentWindow.document.designMode = 'on';
        });


        function onload() {
          iframe.contentWindow.document.body.innerHTML = localStorage.getItem('formData');
          iframe.contentWindow.document.designMode = 'Off';
          $(iframe).addClass("disable");
          $(iframe.contentWindow.document.body).addClass("disable");
          console.log("iframe", iframe);
        };


        onload();

      });
    };
  }
})(jQuery);
