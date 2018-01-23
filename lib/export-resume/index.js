var themeServer =
  process.env.THEME_SERVER || "https://themes.jsonresume.org/theme/";
var registryServer =
  process.env.REGISTRY_SERVER || "https://registry.jsonresume.org";
var request = require("superagent");
var http = require("http");
var fs = require("fs");
var path = require("path");
var read = require("read");
var spinner = require("char-spinner");
var chalk = require("chalk");
var pdf = require("html-pdf");

var SUPPORTED_FILE_FORMATS = ["html", "pdf"];

module.exports = function exportResume(fileName, program, callback) {
  var theme = program.theme;
  var resumeFileName = program.resume;
  resumeJson = '{"basics":{"name":"farid aliev","label":"registered","picture":"","email":"alfarid23+foo@gmail.com","phone":"123123123","website":"","summary":"","location":{"address":"","postalCode":"","city":"San Francisco","countryCode":"United States","region":"CA"}},"work":[{"company":"River's Edge Hospital and Clinic","position":"rn","startDate":"2016-03-31","endDate":null,"summary":null},{"company":"UCSF Medical Center - SAN FRANCISCO, CA","position":"rn","startDate":"2017-02-28","endDate":null,"summary":null},{"company":"Memorial Hermann - Texas Medical Center - HOUSTON, TX","position":"asd","startDate":"2016-01-31","endDate":null,"summary":null},{"company":"Memorial Hermann - Texas Medical Center - HOUSTON, TX","position":"asd","startDate":"2017-01-31","endDate":null,"summary":null},{"company":"USCF Benioff Children's Hospital Oakland - OAKLAND, CA","position":"asdf","startDate":"2017-01-31","endDate":null,"summary":null},{"company":"Wellington Regional Medical Center - WELLINGTON, FL","position":"asds","startDate":"2017-01-31","endDate":null,"summary":null},{"company":"East Texas Medical Center Tyler - TYLER, TX","position":"asdf","startDate":"2015-02-28","endDate":null,"summary":null}]}';

  if (!theme.match("jsonresume-theme-.*")) {
    theme = "jsonresume-theme-" + theme;
  }

  if (!fileName) {
    console.error("Please enter a export destination.");
    process.exit(1);
  }

  var fileNameAndFormat = getFileNameAndFormat(fileName, program.format);
  fileName = fileNameAndFormat.fileName;
  var fileFormatToUse = fileNameAndFormat.fileFormatToUse;
  var format = "." + fileFormatToUse;
  if (format === ".html") {
    createHtml(resumeJson, fileName, theme, format, function() {
      callback(null, fileName, format);
    });
  } else if (format === ".pdf") {
    createPdf(resumeJson, fileName, theme, format, function() {
      callback(null, fileName, format);
    });
  } else {
    console.error(`JSON Resume does not support the ${format} format`);
    process.exit(1);
  }
};

function extractFileFormat(fileName) {
  var dotPos = fileName.lastIndexOf(".");
  if (dotPos === -1) {
    return null;
  }
  return fileName.substring(dotPos + 1).toLowerCase();
}

function createHtml(resumeJson, fileName, theme, format, callback) {
  var html = renderHtml(resumeJson, theme);
  var stream = fs.createWriteStream(
    path.resolve(process.cwd(), fileName + format)
  );

  stream.write(html, function() {
    stream.close(callback);
  });
}

function renderHtml(resumeJson, theme) {
  var contents = "";
  try {
    var themePkg = require(theme);
  } catch (err) {
    // Theme not installed
    console.log(
      "You have to install this theme globally to use it e.g. `npm install -g " +
        theme +
        "`"
    );
    process.exit();
  }
  contents = themePkg.render(resumeJson);
  return contents;
}

function createPdf(resumeJson, fileName, theme, format, callback) {
  var html = renderHtml(resumeJson, theme);
  pdf.create(html, { format: "Letter" }).toFile(fileName + format, callback);
}

function getFileNameAndFormat(fileName, format) {
  var fileFormatFound = extractFileFormat(fileName);
  var fileFormatToUse = format;
  if (format && fileFormatFound && format === fileFormatFound) {
    fileName = fileName.substring(0, fileName.lastIndexOf("."));
  } else if (fileFormatFound) {
    fileFormatToUse = fileFormatFound;
    fileName = fileName.substring(0, fileName.lastIndexOf("."));
  }

  return {
    fileName: fileName,
    fileFormatToUse: fileFormatToUse
  };
}
