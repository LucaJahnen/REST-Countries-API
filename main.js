var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var root = document.querySelector("#root");
var form = document.querySelector(".search-form");
form.addEventListener("submit", function (e) {
    e.preventDefault();
});
var optionContainer = document.querySelector(".option-container");
var selectButton = document.querySelector(".select-region");
var visible = false;
var options = optionContainer.querySelectorAll("button");
options.forEach(function (option) {
    option.addEventListener("click", function () {
        showCountriesByRegion(option.textContent.toLowerCase());
        selectButton.querySelector("span").textContent = option.textContent;
    });
});
var changeVisibility = function (event) {
    event.stopPropagation();
    visible = !visible;
    if (visible) {
        optionContainer.style.visibility = "visible";
    }
    else {
        optionContainer.style.visibility = "hidden";
    }
};
document.body.addEventListener("click", function () {
    visible = false;
    optionContainer.style.visibility = "hidden";
});
selectButton.addEventListener("click", changeVisibility);
optionContainer.addEventListener("click", changeVisibility);
var makeRequest = function (query) { return __awaiter(_this, void 0, void 0, function () {
    var url, response, json, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = "https://restcountries.com/v3.1/";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(url + query)];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Response status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
            case 3:
                json = _a.sent();
                return [2 /*return*/, json];
            case 4:
                error_1 = _a.sent();
                console.log(error_1.message);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var showCountriesByRegion = function (query) { return __awaiter(_this, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, makeRequest("region/" + query)];
            case 1:
                resp = _a.sent();
                root.innerHTML = "";
                resp.forEach(function (country) {
                    var formattedCountry = formatResp(country);
                    renderCard(formattedCountry);
                });
                return [2 /*return*/];
        }
    });
}); };
var getAllCountries = function () { return __awaiter(_this, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, makeRequest("all")];
            case 1:
                resp = _a.sent();
                resp.forEach(function (country) {
                    console.log(country);
                    var formattedCountry = formatResp(country);
                    renderCard(formattedCountry);
                });
                return [2 /*return*/];
        }
    });
}); };
getAllCountries();
function formatResp(resp) {
    return {
        flag: resp.flags.svg,
        name: resp.name.common,
        population: resp.population.toLocaleString("en-US"),
        region: resp.region,
        capital: resp.capital[0]
    };
}
var renderCard = function (obj) { return __awaiter(_this, void 0, void 0, function () {
    var template;
    return __generator(this, function (_a) {
        template = "\n    <section\" class=\"card\">\n        <button class=\"tab-button\">\n        <img class=\"card-img\" src=\"".concat(obj.flag, "\" alt=\"Flag of ").concat(obj.name, "\" />\n        <div class=\"text-wrapper\">\n            <h2 class=\"card-heading\">").concat(obj.name, "</h2>\n            <p><span>Population:</span> ").concat(obj.population, "</p>\n            <p><span>Region:</span> ").concat(obj.region, "</p>\n            <p><span>Capital:</span> ").concat(obj.capital, "</p>\n        </div>\n    </button>\n   </section> \n   ");
        root.innerHTML += template;
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=main.js.map