/*
Copyright (c) 2016, Andreas Girgensohn
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function() {
  'use strict';

  const one_set = ['Elementalist', 'Engineer'];
  const two_handed_weapons = ['Greatsword', 'Hammer', 'Longbow', 'Rifle', 'Shortbow', 'Staff'];
  const elite_weapons = 
        {Elementalist: ['Warhorn'],
         Engineer: ['Hammer'],
         Guardian: ['Longbow'],
         Mesmer: ['Shield'],
         Necromancer: ['Greatsword'],
         Ranger: ['Staff'],
         Revenant: ['Shield'],
         Thief: ['Staff'],
         Warrior: ['Torch']};
  const profession_weapons = 
        {Elementalist: {main: ['Dagger', 'Scepter', 'Staff'],
                        off: ['Dagger', 'Focus', 'Warhorn']},
         Engineer: {main: ['Pistol', 'Hammer', 'Rifle'],
                    off: ['Pistol', 'Shield']},
         Guardian: {main: ['Mace', 'Scepter', 'Sword',
                           'Greatsword', 'Hammer', 'Longbow', 'Staff'],
                    off: ['Focus', 'Shield', 'Torch']},
         Mesmer: {main: ['Scepter', 'Sword', 'Greatsword', 'Staff'],
                  off: ['Focus', 'Pistol', 'Shield', 'Sword', 'Torch']},
         Necromancer: {main: ['Axe', 'Dagger', 'Scepter', 'Greatsword', 'Staff'],
                       off: ['Dagger', 'Focus', 'Warhorn']},
         Revenant: {main: ['Mace', 'Sword', 'Hammer', 'Staff'],
                    off: ['Axe', 'Shield', 'Sword']},
         Ranger: {main: ['Axe', 'Sword', 'Greatsword', 'Longbow', 'Shortbow', 'Staff'],
                  off: ['Axe', 'Dagger', 'Torch', 'Warhorn']},
         Thief: {main: ['Dagger', 'Pistol', 'Sword', 'Shortbow', 'Staff'],
                 off: ['Dagger', 'Pistol']},
         Warrior: {main: ['Axe', 'Mace', 'Sword',
                          'Greatsword', 'Hammer', 'Longbow', 'Rifle'],
                   off: ['Axe', 'Mace', 'Shield', 'Sword', 'Torch', 'Warhorn']}};
  const professions = [];
  const all_modes = ['PvE', 'PvP', 'WvW'];
  let data = {builds: [], modes: all_modes.slice()};
  
  function isTwoHanded(weapon) {
    return weapon && two_handed_weapons.indexOf(weapon) >= 0;
  }

  function updateWeapon(build, mode, slot, hand, weapon) {
    build[mode][slot][hand] = weapon;
    if (isTwoHanded(weapon))
      build[mode][slot].off = '';
  }

  function updateProfession(build) {
    if (!build.profession) {
      for (let i = 0; i < data.modes.length; i++)
        delete build[data.modes[i]];
      return;
    }
    const excluded = build.elite ? [] : elite_weapons[build.profession];
    const pw = profession_weapons[build.profession];
    const hands = ['main', 'off'];
    const count = one_set.indexOf(build.profession) >= 0 ? 1 : 2;
    for (let i = 0; i < data.modes.length; i++) {
      const m = data.modes[i];
      build[m] = build[m] || [];
      build[m].length = count;
      for (let j = count - 1; j >= 0; j--)
        if (!build[m][j])
          build[m].length = j;
      for (let j = 0; j < count; j++)
        for (let k = 0; k < hands.length; k++) {
          const h = hands[k];
          if (build[m][j] && build[m][j][h] &&
              (excluded.indexOf(build[m][j][h]) >= 0 || pw[h].indexOf(build[m][j][h]) < 0))
            delete build[m][j][h];
        }
    }
    //console.log('updateProfession', build);
  }

  function displayWeapons(profession, elite, weapons) {
    if (!profession)
      return '<select class="weapon" disabled></select>' +
      '<select class="weapon" disabled></select>';
    let html = '';
    const excluded = elite ? [] : elite_weapons[profession];
    const count = one_set.indexOf(profession) >= 0 ? 1 : 2;
    const hands = ['main', 'off'];
    for (let i = 0; i < count; i++) {
      if (i > 0)
        html += '<br/>';
      const selected = (weapons && weapons[i]) || {};
      //console.log('selected', selected);
      for (let j = 0; j < hands.length; j++) {
        html += '<select class="weapon"';
        if (hands[j] === 'off' && isTwoHanded(selected.main))
          html += ' disabled';
        html += '><option value=""></option>';
        let items = profession_weapons[profession][hands[j]];
        for (let k = 0; k < items.length; k++) {
          if (excluded.indexOf(items[k]) >= 0)
            continue;
          html += '<option value="' + items[k] + '"';
          if (items[k] === selected[hands[j]])
            html += ' selected';
          html += '>' + items[k] + '</option>';
        }
        html += '</select>';
      }
    }
    return html;
  }
  
  function displayBuild(build) {
    //console.log('displayBuild', build);
    let html = '';
    html += '<td><input type="text" size="15"';
    if (build && build.name)
      html += ' value="' + build.name + '"';
    html += '/></td>';
    html += '<td><select><option value=""></option>';
    for (let i = 0; i < professions.length; i++) {
      html += '<option value="' + professions[i] + '"';
      if (build && build.profession === professions[i])
        html += ' selected';
      html += '>' + professions[i] + '</option>';
    }
    html += '</select></td>';
    html += '<td class="center"><input type="checkbox"';
    if (build && build.elite)
      html += ' checked';
    html += '/></td>';
    for (let i = 0; i < data.modes.length; i++)
      html += '<td>' + displayWeapons(build && build.profession, build && build.elite,
                                      build && build[data.modes[i]]) + '</td>';
    if (build)
      html += '<td><img src="delete.png" alt="" width="16" height="16"/></td>'
    return html;
  }

  function handleWeapon(index, mode, slot, hand) {
    return function(e) {
      data.builds[index] = data.builds[index] || {};
      data.builds[index][mode] = data.builds[index][mode] || [];
      data.builds[index][mode][slot] = data.builds[index][mode][slot] || {};
      data.builds[index][mode][slot][hand] = e.target.value;
      if (isTwoHanded(e.target.value))
        delete data.builds[index][mode][slot].off;
      //console.log('handleWeapon', index, data.builds[index]);
      displayBuilds();
    };
  }
  
  function handleProfession(index) {
    return function(e) {
      data.builds[index] = data.builds[index] || {};
      //console.log('handleProfession', index, e);
      data.builds[index].profession = e.target.value;
      updateProfession(data.builds[index]);
      displayBuilds();
    };
  }
  
  function handleName(index) {
    return function(e) {
      data.builds[index] = data.builds[index] || {};
      data.builds[index].name = e.target.value;
      updateProfession(data.builds[index]);
      displayBuilds();
    };
  }

  function handleElite(index) {
    return function(e) {
      data.builds[index] = data.builds[index] || {};
      //console.log('handleElite', index, e.target.checked, e);
      data.builds[index].elite = e.target.checked;
      updateProfession(data.builds[index]);
      displayBuilds();
    };
  }

  function handleDelete(index) {
    return function(e) {
      if (!confirm('Delete build?'))
        return;
      data.builds.splice(index, 1);
      displayBuilds();
    };
  }

  function handleControl() {
    return function(e) {
      const div = document.getElementById('controls');
      if (!div)
        return;
      const checkboxes = div.querySelectorAll('input[type=checkbox]');
      data.modes.length = 0;
      for (let i = 0; i < checkboxes.length; i++) {
        const cb = checkboxes[i];
        if (cb.checked)
          data.modes.push(cb.value);
      }
      displayBuilds();
    };
  }

  function parseJSONData(st) {
    try {
      const json_data = JSON.parse(st);
      const stripped_builds = [];
      const new_builds = json_data.builds;
      const new_modes = json_data.modes;
      let correct = Array.isArray(new_builds) && Array.isArray(new_modes);
      if (correct)
        for (let i = 0; i < new_modes.length; i++)
          if (all_modes.indexOf(new_modes[i]) < 0) {
            //console.log('bad mode');
            correct = false;
            break;
          }
      if (correct)
        for (let i = 0; i < new_builds.length; i++) {
          const b = new_builds[i];
          const b2 = {};
          stripped_builds.push(b2);
          if (b.name) {
            if (typeof b.name !== 'string') {
              correct = false;
              break;
            }
            b2.name = b.name;
          }
          if (b.elite) {
            if (typeof b.elite !== 'boolean') {
              //console.log('bad elite');
              correct = false;
              break;
            }
            b2.elite = b.elite;
          }
          if (!b.profession)
            continue;
          if (professions.indexOf(b.profession) < 0) {
            //console.log('bad profession', b.profession);
            correct = false;
            break;
          }
          b2.profession = b.profession;
          const pw = profession_weapons[b.profession];
          const excluded = b.elite ? [] : elite_weapons[b.profession];
          const count = one_set.indexOf(b.profession) >= 0 ? 1 : 2;
          for (let j = 0; correct && j < all_modes.length; j++) {
            const m = all_modes[j];
            const ws = b[m];
            if (!ws)
              continue;
            b2[m] = [];
            for (let k = 0; k < count; k++) {
              //console.log('', k, ws[k]);
              if (!ws[k])
                continue;
              const ws2 = {};
              b2[m].push(ws2);
              if (typeof ws[k] !== 'object') {
                //console.log('bad set');
                correct = false;
                break;
              }
              if (ws[k].main) {
                if (excluded.indexOf(ws[k].main) >= 0 || pw.main.indexOf(ws[k].main) < 0) {
                  //console.log('bad main');
                  correct = false;
                  break;
                }
                ws2.main = ws[k].main;
              }
              if (ws[k].off && !isTwoHanded(ws[k].main)) {
                if (excluded.indexOf(ws[k].off) >= 0 || pw.off.indexOf(ws[k].off) < 0) {
                  //console.log('bad off');
                  correct = false;
                  break;
                }
                ws2.off = ws[k].off;
              }
            }
          }
        }
      if (correct) {
        //console.log('before', data.builds);
        //console.log('after', stripped_builds);
        data.builds = stripped_builds;
        data.modes = new_modes;
      }
    }
    catch (ex) {
      console.log('parse', ex);
    }
    displayBuilds();
    displayControls();
  }
  
  function handleJSON() {
    return function(e) {
      parseJSONData(document.getElementById('json').value);
    };
  }

  function addBuildListeners() {
    const table = document.getElementById('builds');
    if (!table)
      return;
    const hands = ['main', 'off'];
    const rows = table.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
      const tr = rows[i];
      const count = one_set.indexOf(data.builds[i - 1] && data.builds[i - 1].profession) >= 0 ? 1 : 2;
      const selects = tr.querySelectorAll('select');
      for (let j = 0; j < selects.length; j++) {
        const m = Math.floor((j - 1) / (2 * count));
        const slot = Math.floor((j - 1 - 2 * count * m) / 2);
        selects[j].addEventListener('change', j == 0 ? handleProfession(i - 1) :
                                    handleWeapon(i - 1, data.modes[m], slot, hands[(j - 1) % 2]));
      }
      const text_input = tr.querySelector('input[type=text]');
      text_input.addEventListener('change', handleName(i - 1));
      const checkbox = tr.querySelector('input[type=checkbox]');
      checkbox.addEventListener('click', handleElite(i - 1));
      const delete_img = tr.querySelector('img');
      if (delete_img)
        delete_img.addEventListener('click', handleDelete(i - 1));
    }
  }
  
  function displayBuilds() {
    const table = document.getElementById('builds');
    if (!table)
      return;
    let html = '<tr><th>Name</th><th>Profession</th><th>Elite</th>';
    for (let i = 0; i < data.modes.length; i++)
      html += '<th>' + data.modes[i] + '</th>';
    for (let i = 0; i <= data.builds.length; i++) {
      html += '<tr';
      if (i % 2 === 0)
        html += ' class="alt"';
      html += '>';
      html += displayBuild(data.builds[i]) + '</tr>';
    }
    //console.log(html);
    table.innerHTML = html;
    addBuildListeners();
    const st = JSON.stringify(data);
    const json = document.getElementById('json');
    if (json)
      json.value = st;
    //console.log(LZString.compressToUTF16(st));
    localStorage.setItem('gw2buildweapons', LZString.compressToUTF16(st));
  }

  function addControlListeners() {
    const div = document.getElementById('controls');
    if (!div)
      return;
    const handler = handleControl();
    const checkboxes = div.querySelectorAll('input[type=checkbox]');
    for (let i = 0; i < checkboxes.length; i++)
      checkboxes[i].addEventListener('click', handler);
    const json = document.getElementById('json');
    if (json)
      json.addEventListener('change', handleJSON());
  }
  
  function displayControls() {
    const div = document.getElementById('controls');
    if (!div)
      return;
    let html = '<p>';
    for (let i = 0; i < all_modes.length; i++) {
      html += '<input type="checkbox" value="' + all_modes[i] + '"';
      if (data.modes && data.modes.indexOf(all_modes[i]) >= 0)
        html += ' checked';
      html += '>&nbsp;' + all_modes[i] + '&nbsp;&nbsp; ';
    }
    html += '</p>';
    div.innerHTML = html;
    addControlListeners();
  }

  for (let p in profession_weapons)
    professions.push(p);
  professions.sort();
  const compressed = localStorage.getItem('gw2buildweapons');
  if (compressed)
    parseJSONData(LZString.decompressFromUTF16(compressed));
  else {
    displayBuilds();
    displayControls();
  }
})();
