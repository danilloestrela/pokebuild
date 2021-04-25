var infoTab = {};
var tableUniqueID = 0;
$(document).ready(function () {
  var pokemons = '';
  // alternative for checkValidity
  $.fn.isValid = function () {
    return this[0].checkValidity()
  }
  // Fill Select Pokemon
  $.getJSON("https://pokeapi.co/api/v2/pokemon/?limit=151", function (data) {
    pokemons = data.results;
    fillPokemon(pokemons, "pokeAdd");
  });

  // Submit Create
  // After selecting a pokemon, take all skills that it can have.

  $("#pokeAdd").submit(function (event) {
    event.preventDefault();
    const fields = $(this).serializeArray();
    if (pokeValidate($(this))) {
      if (create(fields)) {
        alert('Cadastro realizado com sucesso');
      }
    }
  });

  $("#pokeEdit").submit(function (event) {
    event.preventDefault();
    const fields = $(this).serializeArray();
    if (pokeValidate($(this))) {
      if (updateRow(fields)) {
        alert('Editado realizado com sucesso');
        $('#editModal').modal('hide');
      }
    }
  });

  // Delete pokemon: 
  // Clicking in the trash, we delete the pokemon from the table
  $("#pokemon-table").on('click', '.delete', function () {
    deleteRow($(this));
  });

  //Edit pokemon

  $("#pokemon-table").on('click', '.edit', function () {
    let theParent = $(this).parent().parent();

    let skills = theParent.find('td[key="skills"]').text().trim().split(',');
    infoTab = {
      uniqueID: theParent.attr('pokeID'),
      nick: theParent.find('td[key="nick"]').text(),
      pokemon: theParent.find('td[key="pokemon"]').text(),
      abilities: skills
    };

    $('#editModal').modal('show');
  });

  //Right before show, do this 
  $('#editModal').on('show.bs.modal', function () {

    fillPokemon(pokemons, "pokeEdit");

    $(`#pokeEdit .pokemon option[value='${infoTab.pokemon}']`).attr("selected", "selected").trigger('change');

    $('#pokeEdit .apelido').val(infoTab.nick);
    $('#pokeEdit .uniqueID').val(infoTab.uniqueID);
  });

  //Right after shown, do this
  $('#editModal').on('shown.bs.modal', function () {
    infoTab.abilities.map((skill) => { return $(`#pokeEdit .abilities`).find(`option[value='${skill}']`).attr("selected", "selected"); });
  });


  // Put pokemons inside select form and select class field
  function fillPokemon(data, formId) {
    const pokes = [], pokemonSelect = $(`#${formId} .pokemon`);

    $.each(data, function (key, val) {
      pokes.push(
        `
        <option value='${key + 1}'>${val.name}</option>
        `);
    });

    pokemonSelect.empty().append(`<option value="" selected disabled hidden>Selecione um pokemon</option>`);
    pokemonSelect.append(pokes);


    if (!$._data(pokemonSelect.get(0), "events")) {
      pokemonSelect.on('change', function () {
        const id = $(this).val();
        $.getJSON("https://pokeapi.co/api/v2/pokemon/" + id, function (data) {
          const abilities = [], types = [];
          const sprites = `
           <img src="${data.sprites.front_default}" style="max-width:100px;">
          `;

          abilities.push("<option value='' selected disabled>Selecione um habilidade</option>");
          $.each(data.moves, function (key, val) {
            abilities.push(`
            <option value='${val.move.name}'>${val.move.name}</option> 
            `);
          });

          $.each(data.types, function (key, val) {
            types.push(`
            <li key='${key + 1}'>${val.type.name}</li>
            `);
          });


          $(`#${formId} .abilities`).empty().append(abilities);
          $(`#${formId} .sprite`).empty().append(sprites);
          $(`#${formId} .types ul`).empty().append(types);
        });
      });
    }



  }
  // create pokemon in the table
  function create(info) {
    var pokeInfo = {};

    pokeInfo = {
      "pokemon": info[0].value,
      "nick": info[1].value,
      "skillSet": info.filter((pokemon) => {
        return pokemon.name === 'abilities';
      })
    };

    tableResult = `
      <tr pokeId="${tableUniqueID}">
        <td>
        <img src="./assets/imgs/pencil.svg" class="icon edit"> 
        <img src="./assets/imgs/delete.svg" class="icon delete">
        </td>
        <td key="nick">${pokeInfo.nick}</td>
        <td key="pokemon">${pokeInfo.pokemon}</td>
        <td key="skills">${pokeInfo.skillSet.map((abilities) => { return abilities.value; })}
        </td>
      </tr>
  `;

    $("#pokemon-table").find('tbody').append(tableResult);
    tableUniqueID++;

    return true;

  }

  // delete pokemon in table
  function deleteRow(selected) {
    console.log(selected);
    selected.parent().parent().remove();
  }

  // update pokemon info
  function updateRow(info) {
    console.log(info);
    var pokeInfo = {};

    pokeInfo = {
      "uniqueID": info[0].value,
      "pokemon": info[1].value,
      "nick": info[2].value,
      "skillSet": info.filter((pokemon) => {
        return pokemon.name === 'abilities';
      })
    };

    tableResult = `
        <td>
        <img src="./assets/imgs/pencil.svg" class="icon edit"> 
        <img src="./assets/imgs/delete.svg" class="icon delete">
        </td>
        <td key="nick">${pokeInfo.nick}</td>
        <td key="pokemon">${pokeInfo.pokemon}</td>
        <td key="skills">${pokeInfo.skillSet.map((abilities) => { return abilities.value; })}
        </td>
  `;

    $("#pokemon-table").find(`tr[pokeId="${pokeInfo.uniqueID}"]`).empty().append(tableResult);
    return true;
  }


  // Validations
  function pokeValidate(fields) {
    let validate = fields.serializeArray();
    validate = validate.filter((pokemons) => { return pokemons.name === "abilities"; }).length;
    if (validate === 4) {
      if (fields.isValid() && validate) {
        return true;
      } else {
        alert("Todos os campos são requeridos");
        return false;
      }
    } else {
      alert("Você deve selecionar 4 habilidades");
    }
  }

}).jquery;