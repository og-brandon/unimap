// Get the <datalist> and <input> elements.
var facultyList = document.getElementById('faculty-list');
var facultyInput = document.getElementById('faculty-choice');
let classList = document.getElementById('class-list');
var classInput = document.getElementById('class-choice');

// Create a new XMLHttpRequest.
var request = new XMLHttpRequest();
var category_list = []
var popupMarkerArray = new L.FeatureGroup();

// Handle state changes for the request.
request.onreadystatechange = function(response) {
    if (request.readyState === 4) {
        if (request.status === 200) {
            // Parse the JSON
            window.jsonOptions = JSON.parse(request.responseText);

            // Loop over the JSON array.
            for (i in window.jsonOptions.Universidad.Facultades) {
                // Create a new <option> element.
                var option = document.createElement('option');
                // Set the value using the item in the JSON array.
                option.text = window.jsonOptions.Universidad.Facultades[i].nombre;
                // Add the <option> element to the <datalist>.
                $('#faculty-choice').append(option).trigger('change');
            };



            for (i in window.jsonOptions.Universidad.Facultades) {
                for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                    var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                        // console.log(jsonOptions.Universidad.Facultades[i].marcador[k].categoria)
                    if (category_list.includes(category) == false) {
                        category_list.push(category)
                    }
                }
            }



            for (i in category_list) {
                // Create a new <option> element.
                var option = document.createElement('option');
                // Set the value using the item in the JSON array.
                option.text = category_list[i]
                    // Add the <option> element to the <datalist>.
                $('#class-choice').append(option).trigger('change');
            }

            // Update the placeholder text.
            facultyInput.placeholder = "Selecciona una facultad";
            classInput.placeholder = "Selecciona una categoria";
        } else {
            // An error occured :(
            facultyInput.placeholder = "No se puedo cargar :(";
        }
    }
};


// Update the placeholder text.
facultyInput.placeholder = "cargando opciones";

// Set up and make the request.
request.open('GET', 'https://raw.githubusercontent.com/og-brandon/unimap/master/data.json', true);
request.send();

function searchTags() {
    tagsValue = document.getElementById("tags").value.toLowerCase();
    window.marker = {}
    let tagsArray = []

    if (tagsValue !== '') {
        for (i in window.jsonOptions.Universidad.Facultades) {
            for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                var tag = window.jsonOptions.Universidad.Facultades[i].marcador[k].tags
                if (tag.includes(tagsValue) == true) {
                    loopIndex = [i, k]
                    tagsArray.push(loopIndex)
                }
            }
        }

        if (tagsArray.length === 0) {
            alert("No se encontro ningun lugar");
        }
        json_create_markers(tagsArray)

    } else {
        alert("No se encontro ningun lugar");
    }

}

function search() {
    window.marker = {}
    let ikArray = []

    facultad = document.getElementById("faculty-choice").value;
    categoria = document.getElementById("class-choice").value;
    // only work for empty forms, what if user types 'ssss'.
    if (facultad == '' || categoria == '') {
        alert("Seleccione un lugar y categoria");
    } else if (facultad == "Ciudad Universitaria") {
        for (i in window.jsonOptions.Universidad.Facultades) {
            for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                if (categoria == 'Todo') {
                    loopIndex = [i, k]
                    ikArray.push(loopIndex)
                } else {
                    var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                    if (category == categoria) {
                        loopIndex = [i, k]
                        ikArray.push(loopIndex)
                    }
                }
            }
        }
    } else {
        for (i in window.jsonOptions.Universidad.Facultades) {
            if (window.jsonOptions.Universidad.Facultades[i].nombre == facultad) {
                if (categoria == 'Todo') {
                    for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                        loopIndex = [i, k]
                        ikArray.push(loopIndex)
                    }
                    break;
                } else {
                    for (k in window.jsonOptions.Universidad.Facultades[i].marcador) {
                        var category = window.jsonOptions.Universidad.Facultades[i].marcador[k].categoria
                        if (category == categoria) {
                            loopIndex = [i, k]
                            ikArray.push(loopIndex)
                        }
                    }
                    break;
                }
            }

        }
    }
    for (i in ikArray) {
        window.marker[i] = window.jsonOptions.Universidad.Facultades[ikArray[i][0]].marcador[ikArray[i][1]]
    }

    json_create_markers(ikArray)

}

function json_create_markers(json_array) {
    for (i in json_array) {
        window.marker[i] = window.jsonOptions.Universidad.Facultades[json_array[i][0]].marcador[json_array[i][1]]
    }

    // deletes and creates markers when user clicks search
    // https://stackoverflow.com/questions/24318862/removing-all-data-markers-in-leaflet-map-before-calling-another-json
    popupMarkerArray.clearLayers()

    for (i in window.marker) {
        // getInfoFrom writes to .bindPopup
        // https://gis.stackexchange.com/questions/261028/dynamically-create-leaflet-popup-via-javascript-object

        let nombre = "<h3><b>" + marker[i].nombre + "</b></h3>"
        let imagen = ''
        let descripcion = marker[i].descripcion
        let info = imagen + nombre + descripcion

        if (marker[i].hasOwnProperty('foto')) {
            if (marker[i].foto.startsWith('images')) {
                imagen = '<img class="popupimg" src="' + marker[i].foto + '" class="img-fluid"><br><br>'
                info = imagen + nombre + descripcion
            }
        }

        var coordenadasArray = marker[i].coordenadas.split(",")

        var jsonIcon = marker[i].icon

        // list of colors for icons
        // 'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpurple', 'cadetblue'
        if (marker[i].categoria == 'Ventas') {
            var jsonColor = 'orange'
        } else if (marker[i].categoria == 'Comidas') {
            var jsonColor = 'darkred'
        } else if (marker[i].categoria == 'Bebederos') {
            var jsonColor = 'blue'
        } else if (marker[i].categoria == 'Baños') {
            var jsonColor = 'cadetblue'
        } else if (marker[i].categoria == 'Papeleria') {
            var jsonColor = 'orange'
        } else if (marker[i].categoria == 'Cajeros') {
            var jsonColor = 'darkgreen'
        } else if (marker[i].categoria == 'Biblioteca') {
            var jsonColor = 'darkpurple'
        } else if (marker[i].categoria == 'Impresiones') {
            var jsonColor = 'orange'
        } else {
            var jsonColor = 'cadetblue'
        }
        var newMarker = L.marker([coordenadasArray[0], coordenadasArray[1]], { icon: L.AwesomeMarkers.icon({ icon: jsonIcon, prefix: 'fa', markerColor: jsonColor }) }).on('click', onClick).addTo(map);
        newMarker.bindPopup(info)
        popupMarkerArray.addLayer(newMarker)
    }
    map.addLayer(popupMarkerArray);
}

// when user clicks on marker, update routing destination
function onClick(e) {
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
    map.removeLayer(endmarker);
    endmarker = new L.marker(e.latlng, { draggable: 'false', icon: L.AwesomeMarkers.icon({ icon: 'location-arrow', prefix: 'fa', markerColor: 'darkpurple' }) });
    endmarker.on('dragend', function(event) {
        endmarker = event.target;
        var position = endmarker.getLatLng();
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, position);
        endmarker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'false' });
    });
    // map.addLayer(endmarker); don't show marker when selecting destination
    map.closePopup();
}

$('#faculty-choice').select2({
    placeholder: "Seleccionar"
});
$('#class-choice').select2({
    placeholder: "Seleccionar"
});

// https://stackoverflow.com/questions/37478727/how-can-i-make-a-browser-display-all-datalist-options-when-a-default-value-is-se
$('input').on('click', function() {
    $(this).attr('placeholder', $(this).val());
    $(this).val('');
});
$('input').on('mouseleave', function() {
    if ($(this).val() == '') {
        $(this).val($(this).attr('placeholder'));
    }
});

// if (marker[i].categoria == 'Ventas') {
//     var jsonColor = 'cadetblue'
// } else if (marker[i].categoria == 'Comidas') {
//     var jsonColor = 'red'
// } else if (marker[i].categoria == 'Bebederos') {
//     var jsonColor = 'blue'
// } else if (marker[i].categoria == 'Baños') {
//     var jsonColor = 'blue'
// } else if (marker[i].categoria == 'Papeleria') {
//     var jsonColor = 'orange'
// } else if (marker[i].categoria == 'Cajeros') {
//     var jsonColor = 'darkgreen'
// } else if (marker[i].categoria == 'Biblioteca') {
//     var jsonColor = 'darkpurple'
// } else if (marker[i].categoria == 'Impresiones') {
//     var jsonColor = 'orange'
// } else {
//     var jsonColor = 'cadetblue'
// }
