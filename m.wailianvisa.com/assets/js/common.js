/* ajax全局配置 */
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },
    beforeSend: function (xhr) {
        $('.loading').show();
    },
    error: function (error) {
        var res_text = error.responseText.trim();
        if (res_text == '') {
            return false
        }
        var tips = res_text;
        wl_toast.show(tips);
    },
    complete: function () {
        $('.loading').hide();
    }
});

function ajax_handle(options) {
    $.ajax(options);
}
/* 官网埋点 */
var getEventTracking = function (target_obj) {

    var _thisObj = {};

    function getCookie(name) {
        var arr;
        var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return arr[2];
            // return decodeURI(arr[2]);
        }
        return null;
    }

    function getCurrentUrl() {
        return location.href || null;
    }

    function getCurrentTitle() {
        return document.title || null;
    }

    _thisObj['wl_post_info_url'] = getCurrentUrl();
    _thisObj['wl_post_info_title'] = getCurrentTitle();
    _thisObj['wl_cookie_id'] = getCookie('_wl_cookie_id');
    _thisObj['wl_session_id'] = getCookie('_wl_session_id');
    _thisObj['wl_traffic'] = getCookie('_wl_traffic');

    // 合并埋点对象&目标对象
    return Object.assign(_thisObj, target_obj);
}


/*更新视频播放次数*/
function update_video_view_count(country_video_id) {
    if (country_video_id) {
        $.ajax({
            url: '/video_view_count/' + country_video_id,
            type: 'post',
            success: function (result) {
                console.log(result.message);
            }
        });
    }
}

/* 收藏-通用 */
$(document).on('click', '.btn-collect', function () {
    var obj = {};
    var _self = $(this);

    obj['id'] = _self.attr('data-id');
    obj['type'] = _self.attr('data-type');
    obj['s_cbk'] = () => {
        _self.addClass('btn-collected');
        _self.find('span').text('取消');
    };
    obj['c_cbk'] = () => {
        _self.removeClass('btn-collected');
        _self.find('span').text('收藏');
    };
    collect(obj);
});

function collect(params) {
    // 视频 - country_video
    // 文章 - article
    // 活动 - activity
    var obj_id = params['id'];
    var obj_type = params['type'];
    var sucess_cbk = params['s_cbk'];
    var cancel_cbk = params['c_cbk'];

    if (obj_id && obj_type) {
        $.ajax({
            url: '/favorite',
            type: 'post',
            data: {
                object_id: obj_id,
                object_type: obj_type
            },
            success: function (result) {
                var status_code = result.status_code;
                if (status_code !== 0) {
                    wl_toast.show(result.message);
                    return false;
                }
                if (status_code === 0) {
                    wl_toast.show(result.message);
                    if (result.data.action === 1) {
                        sucess_cbk();
                    } else {
                        cancel_cbk();
                    }
                }
            },
        });
    } else {
        wl_toast.show('参数错误');
    }
}

/* 函数 - 获取url参数 */
function getrequest() {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

/* 函数 - 防抖 */
function debounce(fn, wait) {
    var timer = null;
    return () => {
        var context = this;
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, wait);
    };
}

/* 组件 - 提示框 */
var toast = (function () {
    var timer;
    var ele = $('.modal');
    var method = {
        initial() {
            ele.css({
                WebkitTransition: 'all 0.2s linear',
                MozTransition: 'all 0.2s linear'
            });
        },
        show(desc) {
            ele.html(desc);
            ele.addClass('madal-active');
        },
        hide() {
            ele.removeClass('madal-active');
        }
    };

    method.initial();

    return (desc) => {
        if (timer) {
            clearTimeout(timer);
        }
        method.show(desc);
        timer = setTimeout(() => {
            method.hide();
        }, 3000);
    };
})();

var wl_toast = {};
wl_toast.show = toast;

/* 组件 - 侧滑框 */
function CommonSlidebar(trigger, contain) {
    var _self = this;
    _self.c_body = $('html');
    _self.dom_trigger = $(trigger);
    _self.dom_contain = $(contain);

    if (!_self.dom_trigger) {
        return false;
    }

    _self.dom_trigger.bind('click', _self.bind_open.bind(this));
    _self.dom_contain.bind('click', _self.bind_close.bind(this));
}

CommonSlidebar.prototype = {
    bind_open() {
        this.dom_contain.css('transition', 'all 0.5s ease-out');
        this.dom_contain.addClass('page_shadow_active');
        this.c_body.css('overflow', 'hidden');
    },
    bind_close(e) {
        var node_name = e.target.nodeName.toLowerCase();
        if (node_name == 'div') {
            this.close();
        }
    },
    close() {
        this.dom_contain.removeClass('page_shadow_active');
        this.c_body.css('overflow', 'auto');
    },
    constructor: CommonSlidebar,
};

/* 组件 - 倒计时 */
function countdown(dom) {
    var obj = {};
    var count = 60;
    var timer = null;
    obj.isReset = () => {
        return timer == null ? true : false;
    };
    obj.render = () => {
        timer = setInterval(function () {
            if (count <= 0) {
                count = 60;
                clearInterval(timer);
                $(dom).text('重新发送');
                if ($(dom).hasClass('active')) {
                    $(dom).removeClass('active');
                }
                timer = null;
                return false;
            }
            count--;
            $(dom).text(count);
        }, 1000);
    };
    obj.initial = () => {
        count = 60;
        clearInterval(timer);
        $(dom).text('发送');
        timer = null;
    };
    return obj;
}

/* 验证正则 */
var validateRegExp = {
    email: /\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
    mobile: /^1[3456789][0-9]{9}$/,
};

// 签约
var MD5 = function (d) {
    result = M(V(Y(X(d), 8 * d.length)));
    return result.toLowerCase()
};
function M(d) {
    for (var _, m = "0123456789ABCDEF", f = "",
        r = 0; r < d.length; r++)_ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
    return f
}
function X(d) {
    for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++)_[m] = 0;
    for (m = 0; m < 8 * d.length; m += 8)_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
    return _
}
function V(d) {
    for (var _ = "", m = 0; m < 32 * d.length; m += 8)_ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
    return _
}
function Y(d, _) {
    d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
    for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
        var h = m, t = f, g = r, e = i;
        f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e)
    }
    return Array(m, f, r, i)
}
function md5_cmn(d, _, m, f, r, i) {
    return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m)
}
function md5_ff(d, _, m, f, r, i, n) {
    return md5_cmn(_ & m | ~_ & f, d, _, r, i, n)
}
function md5_gg(d, _, m, f, r, i, n) {
    return md5_cmn(_ & f | m & ~f, d, _, r, i, n)
}
function md5_hh(d, _, m, f, r, i, n) {
    return md5_cmn(_ ^ m ^ f, d, _, r, i, n)
}
function md5_ii(d, _, m, f, r, i, n) {
    return md5_cmn(m ^ (_ | ~f), d, _, r, i, n)
}
function safe_add(d, _) {
    var m = (65535 & d) + (65535 & _);
    return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
}
function bit_rol(d, _) {
    return d << _ | d >>> 32 - _
}

function Base64() {
    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    };
    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    };

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    };

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

// 小于10需要前置0
function changePreStr(value) {
    return (value >= 10) ? value : ("0" + value);
}

// 和上方changePreStr结合使用
function formatDate(time, format = 'YYMMDDhhmmss') {
    var date = new Date(time);
    var year = date.getFullYear(),
        month = changePreStr(date.getMonth() + 1),//月份是从0开始的
        day = changePreStr(date.getDate()),
        hour = changePreStr(date.getHours()),
        min = changePreStr(date.getMinutes()),
        sec = changePreStr(date.getSeconds());

    return format.replace(/YY/g, year)
        .replace(/MM/g, month)
        .replace(/DD/g, day)
        .replace(/hh/g, hour)
        .replace(/mm/g, min)
        .replace(/ss/g, sec);

}

function genCrmTokenAndSigned(utFlg) {
    let ut, sign_custom_str, signed;
    let base = new Base64();
    let current_time_str = formatDate(new Date().getTime());
    if (!utFlg || utFlg == null) {
        ut = ''
        sign_custom_str = 'wailianvisaCRMAPI_'
        signed = MD5(sign_custom_str + ut + current_time_str);
    } else {
        ut = utFlg
        sign_custom_str = 'wailianvisaCRMAPI';
        signed = MD5(sign_custom_str + "_" + ut + "_" + current_time_str);
    }
    let token = base.encode(ut + current_time_str);
    return { token: token, signed: signed }
}

// 获取图片img的真实宽高大小
function getImageWidth(url, callback) {
    var img = new Image();
    img.src = url;
    // 如果图片被缓存，则直接返回缓存数据
    if (img.complete) {
        callback(img.width, img.height);
    } else {
        img.onload = function () {
            callback(img.width, img.height);
        }
    }
}

/* 配置CRM对接环境链接 */
function setUrlConfigEnv(path) {
    var crm_dist = 'https://crm.wailianvisa.com';
    var crm_test = 'https://crmtest.wailianvisa.com';
    var host = location.host == 'm.wailianvisa.com' ? crm_dist : crm_test;

    return host + path;
}

var publicMethods = {};

/* CRM验证规则 */
publicMethods.checkCrmDoc = (function () {

    /* MD5函数 - start */
    let _MD5 = function (d) {
        let result = M(V(Y(X(d), 8 * d.length)));
        return result.toLowerCase();
    };
    function M(d) {
        for (var _, m = "0123456789ABCDEF", f = "",
            r = 0; r < d.length; r++)_ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
        return f;
    }
    function X(d) {
        for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++)_[m] = 0;
        for (m = 0; m < 8 * d.length; m += 8)_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
        return _;
    }
    function V(d) {
        for (var _ = "", m = 0; m < 32 * d.length; m += 8)_ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
        return _;
    }
    function Y(d, _) {
        d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
        for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
            var h = m, t = f, g = r, e = i;
            f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e)
        }
        return Array(m, f, r, i);
    }
    function md5_cmn(d, _, m, f, r, i) {
        return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
    }
    function md5_ff(d, _, m, f, r, i, n) {
        return md5_cmn(_ & m | ~_ & f, d, _, r, i, n);
    }
    function md5_gg(d, _, m, f, r, i, n) {
        return md5_cmn(_ & f | m & ~f, d, _, r, i, n);
    }
    function md5_hh(d, _, m, f, r, i, n) {
        return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
    }
    function md5_ii(d, _, m, f, r, i, n) {
        return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
    }
    function safe_add(d, _) {
        var m = (65535 & d) + (65535 & _);
        return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m;
    }
    function bit_rol(d, _) {
        return d << _ | d >>> 32 - _;
    }
    /* MD5函数 - end */

    /* 个位补零 */
    function _dateLengtgInit(value) {
        return (value >= 10) ? value : ("0" + value);
    }

    /* 当前时间戳 */
    function _timeStamp() {
        let d = new Date();
        let year = d.getFullYear().toString();
        let month = (d.getMonth() + 1).toString();
        month = _dateLengtgInit(month);
        let day = d.getDate().toString();
        day = _dateLengtgInit(day);
        let hour = d.getHours().toString();
        hour = _dateLengtgInit(hour);
        let minute = d.getMinutes().toString();
        minute = _dateLengtgInit(minute);
        let second = d.getSeconds().toString();
        second = _dateLengtgInit(second);
        let time = year + month + day + hour + minute + second;
        return time;
    }

    /* base64转化 */
    function _base64Encode(input) {
        let rv;
        rv = encodeURIComponent(input);
        rv = decodeURIComponent(rv);
        rv = window.btoa(rv);
        return rv;
    }

    //Crm自定义标识
    let _signStr = 'wailianvisaCRMAPI';

    return {
        concatUrl(path, token, signed) {
            let prefix_url = setUrlConfigEnv(path);
            return prefix_url + '?token=' + token + '&signed=' + signed;
        },
        render(path) {
            let timestamp_str = _timeStamp();
            let token = _base64Encode(timestamp_str);
            let signed = _MD5(_signStr + '_' + timestamp_str);

            return this.concatUrl(path, token, signed);
        },
        // 需携带ut类型
        renderMixUt(ut, path) {
            let timestamp_str = _timeStamp();
            let token = _base64Encode(ut + timestamp_str);
            let signed = _MD5(_signStr + '_' + ut + '_' + timestamp_str);

            return this.concatUrl(path, token, signed);
        },
    };

})();
