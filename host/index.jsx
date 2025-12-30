/**
 * AI Design Assistant - ExtendScript Bridge
 * Handles communication between CEP panel and Adobe Illustrator
 */

#target illustrator

// JSON polyfill for ExtendScript
if (typeof JSON === 'undefined') {
    JSON = {
        stringify: function (obj) {
            var t = typeof (obj);
            if (t != "object" || obj === null) {
                if (t == "string") return '"' + obj + '"';
                return String(obj);
            } else {
                var n, v, json = [], arr = (obj && obj.constructor == Array);
                for (n in obj) {
                    v = obj[n];
                    t = typeof (v);
                    if (t == "string") v = '"' + v + '"';
                    else if (t == "object" && v !== null) v = JSON.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },
        parse: function (str) {
            return eval('(' + str + ')');
        }
    };
}

// Capture artboard as PNG and return base64
// Capture artboard as PNG and return base64
function captureArtboard() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open. Please open or create a document first."
            });
        }

        var doc = app.activeDocument;

        if (doc.artboards.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No artboards found in the document."
            });
        }

        // Get the active artboard
        var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var artboardRect = artboard.artboardRect;

        // Create a temporary file for export
        var tempFolder = Folder.temp;
        var tempFile = new File(tempFolder + "/ai_assistant_temp_" + new Date().getTime() + ".png");

        // Export options for PNG
        var exportOptions = new ExportOptionsPNG24();
        exportOptions.antiAliasing = true;
        exportOptions.transparency = false;
        exportOptions.artBoardClipping = true;
        exportOptions.horizontalScale = 100;
        exportOptions.verticalScale = 100;

        // Export the artboard
        doc.exportFile(tempFile, ExportType.PNG24, exportOptions);

        // Read the file and convert to base64
        tempFile.encoding = "BINARY";
        if (!tempFile.open("r")) {
            return JSON.stringify({
                success: false,
                error: "Failed to open temporary file."
            });
        }

        var fileContent = tempFile.read();
        tempFile.close();

        // Convert to base64
        var base64 = encodeBase64(fileContent);

        // Clean up temp file
        tempFile.remove();

        return JSON.stringify({
            success: true,
            imageData: base64,
            artboardName: artboard.name,
            width: artboardRect[2] - artboardRect[0],
            height: artboardRect[1] - artboardRect[3]
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Capture selected items as PNG and return base64
function captureSelection() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;

        if (doc.selection.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No items selected. Please select something on the artboard."
            });
        }

        // Copy selection
        app.copy();

        // Create a temporary document
        // Use RGB color space for better compatibility with screen viewing
        var tempDoc = app.documents.add(DocumentColorSpace.RGB, 1000, 1000);

        // Paste selection
        app.paste();

        // Resize artboard to fit selection
        // Select all in temp doc (which is just what we pasted)
        tempDoc.selectObjectsOnActiveArtboard();
        var selection = tempDoc.selection;

        if (selection.length > 0) {
            // Calculate bounds of all selected items
            var left = selection[0].geometricBounds[0];
            var top = selection[0].geometricBounds[1];
            var right = selection[0].geometricBounds[2];
            var bottom = selection[0].geometricBounds[3];

            for (var i = 1; i < selection.length; i++) {
                if (selection[i].geometricBounds[0] < left) left = selection[i].geometricBounds[0];
                if (selection[i].geometricBounds[1] > top) top = selection[i].geometricBounds[1];
                if (selection[i].geometricBounds[2] > right) right = selection[i].geometricBounds[2];
                if (selection[i].geometricBounds[3] < bottom) bottom = selection[i].geometricBounds[3];
            }

            // Add some padding
            var padding = 20;
            var rect = [left - padding, top + padding, right + padding, bottom - padding];

            tempDoc.artboards[0].artboardRect = rect;
        }

        // Create a temporary file for export
        var tempFolder = Folder.temp;
        var tempFile = new File(tempFolder + "/ai_assistant_selection_" + new Date().getTime() + ".png");

        // Export options for PNG
        var exportOptions = new ExportOptionsPNG24();
        exportOptions.antiAliasing = true;
        exportOptions.transparency = true; // Transparent background for selection
        exportOptions.artBoardClipping = true;
        exportOptions.horizontalScale = 100;
        exportOptions.verticalScale = 100;

        // Export the temp doc
        tempDoc.exportFile(tempFile, ExportType.PNG24, exportOptions);

        // Close temp doc without saving
        tempDoc.close(SaveOptions.DONOTSAVECHANGES);

        // Read the file and convert to base64
        tempFile.encoding = "BINARY";
        if (!tempFile.open("r")) {
            return JSON.stringify({
                success: false,
                error: "Failed to open temporary file."
            });
        }

        var fileContent = tempFile.read();
        tempFile.close();

        // Convert to base64
        var base64 = encodeBase64(fileContent);

        // Clean up temp file
        tempFile.remove();

        return JSON.stringify({
            success: true,
            imageData: base64
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Get document information
function getDocumentInfo() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var info = {
            success: true,
            name: doc.name,
            width: doc.width,
            height: doc.height,
            artboards: doc.artboards.length,
            layers: doc.layers.length,
            pathItems: doc.pathItems.length,
            textFrames: doc.textFrames.length,
            colorSpace: doc.documentColorSpace.toString()
        };

        return JSON.stringify(info);

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Get colors used in document
function getDocumentColors() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var colors = [];
        var colorSet = {};

        // Collect colors from path items
        for (var i = 0; i < doc.pathItems.length; i++) {
            var item = doc.pathItems[i];

            if (item.filled && item.fillColor) {
                var fillColor = getColorString(item.fillColor);
                if (fillColor && !colorSet[fillColor]) {
                    colors.push(fillColor);
                    colorSet[fillColor] = true;
                }
            }

            if (item.stroked && item.strokeColor) {
                var strokeColor = getColorString(item.strokeColor);
                if (strokeColor && !colorSet[strokeColor]) {
                    colors.push(strokeColor);
                    colorSet[strokeColor] = true;
                }
            }
        }

        return JSON.stringify({
            success: true,
            colors: colors
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Helper: Convert color to string representation
function getColorString(color) {
    try {
        if (color.typename === "RGBColor") {
            return "rgb(" + Math.round(color.red) + ", " +
                Math.round(color.green) + ", " +
                Math.round(color.blue) + ")";
        } else if (color.typename === "CMYKColor") {
            return "cmyk(" + Math.round(color.cyan) + ", " +
                Math.round(color.magenta) + ", " +
                Math.round(color.yellow) + ", " +
                Math.round(color.black) + ")";
        } else if (color.typename === "GrayColor") {
            return "gray(" + Math.round(color.gray) + ")";
        }
    } catch (e) {
        return null;
    }
    return null;
}

// Helper: Base64 encoding
function encodeBase64(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

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
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }

    return output;
}

// Create a new text frame with specified content
function createTextFrame(content, x, y) {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var textFrame = doc.textFrames.add();
        textFrame.contents = content;
        textFrame.position = [x || 100, y || 100];

        return JSON.stringify({
            success: true,
            message: "Text frame created successfully."
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Create a rectangle
function createRectangle(x, y, width, height, fillColor) {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var rect = doc.pathItems.rectangle(y || 100, x || 100, width || 100, height || 100);

        if (fillColor) {
            var color = new RGBColor();
            color.red = fillColor[0] || 0;
            color.green = fillColor[1] || 0;
            color.blue = fillColor[2] || 0;
            rect.filled = true;
            rect.fillColor = color;
        }

        return JSON.stringify({
            success: true,
            message: "Rectangle created successfully."
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Get selected items info
function getSelectionInfo() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var selection = doc.selection;

        if (selection.length === 0) {
            return JSON.stringify({
                success: true,
                itemCount: 0,
                message: "No items selected."
            });
        }

        var info = {
            success: true,
            itemCount: selection.length,
            items: []
        };

        for (var i = 0; i < Math.min(selection.length, 10); i++) {
            var item = selection[i];
            info.items.push({
                type: item.typename,
                filled: item.filled || false,
                stroked: item.stroked || false
            });
        }

        return JSON.stringify(info);

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Place image from file path
function placeImageFromFile(filePath) {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                error: "No document is open."
            });
        }

        var doc = app.activeDocument;
        var imageFile = new File(filePath);

        if (!imageFile.exists) {
            return JSON.stringify({
                success: false,
                error: "Image file not found at path: " + filePath
            });
        }

        // Place the image
        var placedItem = doc.placedItems.add();
        placedItem.file = imageFile;

        // Position in center of artboard BEFORE embedding
        if (doc.artboards.length > 0) {
            var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            var artboardRect = artboard.artboardRect;
            var centerX = (artboardRect[0] + artboardRect[2]) / 2;
            var centerY = (artboardRect[1] + artboardRect[3]) / 2;

            placedItem.position = [
                centerX - (placedItem.width / 2),
                centerY + (placedItem.height / 2)
            ];
        }

        // Embed the image to ensure it stays
        placedItem.embed();

        return JSON.stringify({
            success: true,
            message: "Image placed and embedded on artboard successfully."
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: "Error in placeImageFromFile: " + error.toString()
        });
    }
}

// Write base64 image to temp file and return path
function writeImageToTemp(base64Data) {
    try {
        var tempFolder = Folder.temp;
        var tempFile = new File(tempFolder + "/ai_gen_" + new Date().getTime() + ".png");

        tempFile.encoding = "BINARY";
        if (!tempFile.open("w")) {
            return JSON.stringify({
                success: false,
                error: "Failed to create temp file."
            });
        }

        var decoded = decodeBase64(base64Data);
        tempFile.write(decoded);
        tempFile.close();

        return JSON.stringify({
            success: true,
            filePath: tempFile.fsName
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// Helper: Decode base64
function decodeBase64(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

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

    return output;
}

// Global variables for chunk processing
var tempImageFile = null;
var imageChunks = [];

// Initialize image write process
function initImageWrite(totalChunks) {
    try {
        var tempFolder = Folder.temp;
        tempImageFile = new File(tempFolder + "/ai_gen_" + new Date().getTime() + ".png");
        imageChunks = [];

        // Escape backslashes for JSON
        var filePath = tempImageFile.fsName.replace(/\\/g, '/');

        return '{"success":true,"filePath":"' + filePath + '","totalChunks":' + totalChunks + '}';
    } catch (error) {
        return '{"success":false,"error":"' + error.toString().replace(/"/g, '\\"') + '"}';
    }
}

// Append chunk of base64 data
function appendImageChunk(chunk) {
    try {
        imageChunks.push(chunk);
        return '{"success":true,"chunksReceived":' + imageChunks.length + '}';
    } catch (error) {
        return '{"success":false,"error":"' + error.toString().replace(/"/g, '\\"') + '"}';
    }
}

// Finalize image writing and place on artboard
function finalizeAndPlaceImage(filePath) {
    try {
        if (app.documents.length === 0) {
            return '{"success":false,"error":"No document is open."}';
        }

        // Combine all chunks
        var fullBase64 = imageChunks.join('');

        // Decode and write to file
        tempImageFile.encoding = "BINARY";
        if (!tempImageFile.open("w")) {
            return '{"success":false,"error":"Failed to open temp file for writing."}';
        }

        var decoded = decodeBase64(fullBase64);
        tempImageFile.write(decoded);
        tempImageFile.close();

        // Place the image in Illustrator
        var doc = app.activeDocument;
        var placedItem = doc.placedItems.add();
        placedItem.file = tempImageFile;

        // Position in center of artboard
        if (doc.artboards.length > 0) {
            var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            var artboardRect = artboard.artboardRect;
            var centerX = (artboardRect[0] + artboardRect[2]) / 2;
            var centerY = (artboardRect[1] + artboardRect[3]) / 2;

            placedItem.position = [
                centerX - (placedItem.width / 2),
                centerY + (placedItem.height / 2)
            ];
        }

        // Clean up
        imageChunks = [];

        return '{"success":true,"message":"Image placed on artboard successfully."}';

    } catch (error) {
        return '{"success":false,"error":"' + error.toString().replace(/"/g, '\\"') + '"}';
    }
}

// Test function
function sayHello() {
    return JSON.stringify({
        success: true,
        message: "Hello from ExtendScript! AI Assistant is connected."
    });
}
