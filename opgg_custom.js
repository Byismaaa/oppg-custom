/* santo comment: can't put api keys directly on code, also not in client-facing html */
/* santo comment: use backend for this */
let api_key = "RGAPI-cd92b353-a525-4149-be93-2276bbe1c2b3";

/* santo comment: javascript naming convention, don't use absolute path, use relative path */
/* santo comment: are you using this */
let IMG_FOLDER = "C:\Users\Administrator\img"
let cache = null;

/* santo comment: javascript uses camel case, so this is correct, nice! */
/* santo comment: add comments explaining what is this function doing, what is the argument, etc */
async function getPUUID(IGN) {
    const api_url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${IGN}?api_key=${api_key}`
    const resp = await fetch(api_url);
    const data = await resp.json();
    /* santo comment: try to handle potential errors here, what if RIOT api fails and returns a null? */
    return data.puuid;
}
async function getIconLevels(puuid) {
    /* santo comment: research if you have to use const or let when working with variables in js */
    const profile_URl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${api_key}`
    // console.log(profile_URl)
    const resp = await fetch(profile_URl);
    const data = await resp.json();
    // console.log(data);
    const icon_url = `<img id="profileIcon" class="profile-icon" alt="Icono de perfil" src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${data.profileIconId}.jpg">`;
    /* santo comment: this function combines logic for the frontend and for the backend, keep this in mind */
    $(".combination-icons").append(icon_url);
    return { profileIconId: data.profileIconId, summonerLevel: data.summonerLevel };
}
async function getMatches(puuid) {
    let matches = "";
    const runeMap = await loadAllRunesMap();
    const matches_url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${api_key}`
    const resp = await fetch(matches_url);
    const data = await resp.json();
    let color = "";
    let classKDA = "";
    for (const element of data) {
        let player = await get_all_important_data_match(puuid, element);
        if (player.resultGame == true) {
            color = 'linear-gradient(90deg,rgba(2, 184, 32, 1) 0%, rgba(0, 59, 41, 1) 100%)';
        } else {
            color = 'linear-gradient(90deg,rgba(69, 11, 1, 1) 0%, rgba(31, 12, 0, 1) 100%)';
        }
        if (player.kda >= 5) {
            classKDA = "perfectKDA"
        }
        else if (player.kda >= 1.5) {
            classKDA = "goodKDA"
        }
        else {
            classKDA = "badKDA"
        }
        const spell1 = await getSpellIcon(player.summoner1);
        const spell2 = await getSpellIcon(player.summoner2);
        console.log(player.summoner2)
        /* santo comment: backend (gets the data from  the RIOT api or database, and sends the data to the client/frontend), frontend (receives the data from the backend and creates the HTML structures and components showing the match results) */
        matches += `<div class="matchesBOX" style="background:${color}">
            <!-- champ image -->
            <div class="matchTextInfo">
                <h4 style="color:white;">${player.gameDuration}</h4>
            </div>
                    <img class="champion" src="https://ddragon.leagueoflegends.com/cdn/16.12.1/img/champion/${player.champion}.png"
                        alt="pic" />
                    <!-- KDA CREATED -->
                    <div class="KDA">
                        <div class="score">
                            <span>${player.kills}</span> / <span>${player.deaths}</span> / <span>${player.assists}</span>
                        </div>
                        <p class="Rounded-kda ${classKDA}">${player.kda} KDA</p>
                    </div>
                    <!-- runes -->
                    <div class="runes_items">
                    <div class="summonerSpells">
                        <div id="Summonerspell1"> <img class="spell" src="${spell1}"/></div>
                        <div id="Summonerspell2"> <img class="spell" src="${spell2}"/> </div>
                    </div>
                    <div class="runes">
                        <div id="rune1">
                          <img class="rune-2" src="${runeMap.perkMap[player.primary_runes]['iconPath']}" alt="primary rune" />
                        
                        </div>
                        <div id="rune2">
                        <img class="rune-2" src="${runeMap.runeMap[player.secodary_rune_tree]['iconPath']}" alt="secondary rune" />
                        </div>
                        </div>
                        <div class="items">`

        for (let i = 0; i < 6; i++) {
            if (`${player.items[i]}` != 0) {
                matches += `<img class ="itemSolo" id="${player.items[i]}" src="https://ddragon.leagueoflegends.com/cdn/16.15.1/img/item/${player.items[i]}.png"/> `
            }
        }
        matches += `</div>
                
                    </div>

                </div>`;
    }


    $("#matchesID").html(matches);

}

/* santo comment: formatTime, change name or add comment explaining what is this doing */
async function getTime(gameDuration) {
    let seconds = gameDuration % 60;
    let minutes = gameDuration - seconds
    minutes = minutes / 60;
    if (seconds < 10) {
        seconds = `0${seconds}`
    }

    let total = `${minutes}:${seconds}`
    return total
}

/* santo comment: fix name convention for the function name */
async function get_all_important_data_match(puuid, matchID) {
    let match_url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${api_key}`;

    const resp = await fetch(match_url)
    const data = await resp.json();
    // console.log(puuid);
    // console.log(match_url);
    let items = [];
    let gameDuration = await getTime(data.info.gameDuration);

    /* santo comment: currentUserIndex, change name or add comment what is this doing */
    /* santo comment: check if this would work 
    let player = data.info.participants[index]
    let resultGame = player.win
    let damageDeal = player.totalDamageDealtToChampion
    ... */
    const index = data.info.participants.findIndex(p => p.puuid === puuid);
    let resultGame = data.info.participants[index].win;
    let damageDeal = data.info.participants[index].totalDamageDealtToChampion;
    // let physical
    let champion = data.info.participants[index].championName;
    let kda = Math.round(data.info.participants[index].challenges.kda * 10) / 10;
    let summoner1 = data.info.participants[index].summoner1Id;
    let summoner2 = data.info.participants[index].summoner2Id;
    let kills = data.info.participants[index].kills;
    let deaths = data.info.participants[index].deaths;
    let assists = data.info.participants[index].assists;
    let lane = data.info.participants[index].individualPosition;
    for (let i = 0; i <= 5; i++) {
        items.push(data.info.participants[index][`item${i}`]);
    }
    let primary_runes = data.info.participants[index].perks.styles[0].selections[0].perk;
    let secondary_runes = data.info.participants[index].perks.styles[1].selections[0].perk;
    let secodary_rune_tree = data.info.participants[index].perks.styles[1].style;


    // let runeIcons = await getRunesIcons(primary_runes, secondary_runes);

    /* santo comment: this is a pedazo of json, try to structure this in some way */
    return { champion, resultGame, damageDeal, kda, kills, deaths, assists, lane, items, primary_runes, secondary_runes, secodary_rune_tree, gameDuration, summoner1, summoner2 };
}

async function getRank(puuid) {
    let rank_url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${api_key}`
    const resp = await fetch(rank_url)
    const data = await resp.json();
    let rank = data[0].tier;
    // console.log(data)
    // console.log(rank)
    /* santo comment: tiers/ folder isn't accessible from the repo, fix this */
    let rankURL = `<img id="rankIMG" class="rankIMG" alt="Icono de perfil" src="tiers/${rank}.png">`;
    $(".combination-icons").append(rankURL);
}

async function getSpellIcon(spellId) {
    /* santo comment: this is a true constant, you should keep it outside of a function */
    const SPELLS = {
        1: "summoner_boost",
        3: "summoner_exhaust",
        4: "summoner_flash",
        6: "summoner_haste",
        7: "summoner_heal",
        11: "summoner_smite",
        12: "summoner_teleport_new",
        13: "summonermana",
        14: "summonerignite",
        21: "summonerbarrier",
        32: "summoner_mark"
    };

    const name = SPELLS[spellId];
    if (!name) return "";
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/${name}.png`;

}

async function loadAllRunesMap() {
    const res = await fetch(
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json"
    );
    const perks = await res.json();

    const fetch_trees = await fetch("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perkstyles.json")
    const runeTree = await fetch_trees.json();

    const perkMap = {};
    const runeMap = {};
    // get all runes icon

    for (const perk of perks) {
        const path = perk['iconPath'].replace("/lol-game-data/assets/", "").toLowerCase();

        perkMap[perk.id] = {
            name: perk.name,
            iconPath: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${path}`,
            shortDesc: perk.shortDesc,
            longDesc: perk.longDesc,
        }
    }


    for (const rune of runeTree.styles) {
        const path_TREE = rune['iconPath'].replace("/lol-game-data/assets/", "").toLowerCase();

        runeMap[rune.id] = {
            name: rune.name,
            iconPath: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${path_TREE}`,
            tooltip: rune.tooltip,
        }
    }


    return { perkMap, runeMap };
}

// CREAR PERFIL
/* santo comment: use english */
/* santo comment: this is a frontend logic, keep that in mind when doing the migration */
async function crearPerfil(puuid, forzar = false) {

    // const params = new URLSearchParams(window.location.search);

    const IGN = puuid.replace("#", "/");

    const partes = IGN.split("/");

    const gameName = partes[0];
    const tagLine = partes[1];

    $("#name").text(`#${tagLine}`);
    $("#hastagname").text(gameName);

    // window.location.href =
    //     `customOPGG.html?profile=${gameName}/${tagLine}`;

    puuid = await getPUUID(IGN);
    getIconLevels(puuid)
    getMatches(puuid);
    getRank(puuid);
    loadAllRunesMap();
}

window.crearPerfil = crearPerfil;

$(document).ready(function () {
});

// v1/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png
// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/
// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png
// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/firststrike/firststrike.png

// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7204_resolve.png
// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7200_domination.png


// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/
// https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/jade-perks.json ICONOS ARMADURA MAGIC RESIST Y TAL