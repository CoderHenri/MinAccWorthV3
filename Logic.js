var LandGridAll = [];
var WorldGrid = [];
var FloorPrices = [];
var ETHWalletAxie = [];
var ETHWalletLand = []; //ganzes Land mit Koordinaten
var ETHWalletItem = [];

var NonEstatePlotsPrice = [];

var EntireFloorPriceArray = [];

var EntireEstatePrice = 0;
var GesamtWertAxie = 0;
var GesamtWertItem = 0;

var RiverMulti = 2;
var RoadMulti = 1.25;
var NodeMulti = 1.5;

var DynamicEstateRemover = [];

var brCheat = 0;


//working alt query
// {"operationName":"GetAxieBriefList", "query":"query GetAxieBriefList {\n  axies(auctionType: Sale, criteria: {classes:Bird, numMystic:1}, from: 0, sort: PriceAsc, size: 1) {\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  __typename\n}\n"}

function FormulaAlert() {
    alert("Estate Price Formula: \n Price = (Floor Price of the Land Type * (Base Plots + Plots near Water * " + RiverMulti + "\n + Plots near Roads * " + RoadMulti + " + Plots near Nodes * " + NodeMulti + ")) * 1.5 (Savannah & Forest) or 1.3 (Arctic) (Inside River) * Size of Estate \n \n XXL = 100+Plots = *3 \n XL = 50+Plots = *2.5 \n L = 36+Plots = *1.8 \n M = 25+Plots = *1.6 \n MS = 16+Plots = *1.4 \n S = 9+Plots = *1.2");
}

function SingleAlert() {
    alert("These are all the plots with less than 9 connected plots \n Multiplicators added for the plots were next to a Node, River or Road \n and if they were inside or outside the River and not Genesis or Mystic plots \n (Price = (Floor Price of the Land Type * (Plot near Water * " + RiverMulti + " + Plot near Road * " + RoadMulti + " + Plot near Node * " + NodeMulti + ")) * 1.5 (Savannah & Forest) or 1.3 (Arctic) (Inside River)");
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function PriceDisplayHuman(num) {
    num = num * Math.pow(10, -18);
    num = Math.round((num + Number.EPSILON) * 10000) / 10000;
    return num;
}

async function ReadTextFile() {

    WorldGrid = await AsyncTextReader('./Land_Grid_Data_Combined.txt');

    LandGridAll = await AsyncTextReader('./Land_Grid_Data_Multiplier_V1.txt');
    return LandGridAll;
}

function AsyncTextReader(Place) {
    return new Promise(function (resolve, reject) {
        var objXMLhttp = new XMLHttpRequest()
        objXMLhttp.open("GET", Place, true);
        objXMLhttp.send();
        objXMLhttp.onreadystatechange = function(){
        if (objXMLhttp.readyState == 4){
          if(objXMLhttp.status == 200) {
            var TestParse = objXMLhttp.responseText;
            TestParse = JSON.parse(TestParse);
            return resolve(TestParse);
          } else {
            console.log("error");
            return resolve("error");
          }
        }
      }
    });
}

async function LoadFloorPrices() {
    var url = "https://graphql-gateway.axieinfinity.com/graphql";

    await ReadTextFile();

    //Query Entire Axie Floor Data
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList",
            "query":"query GetAxieBriefList{"+
                "normal:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc){results{...AxieBrief}}"+
                "origin:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{title:[\"Origin\"]}){results{...AxieBrief}}"+
                "mystic1:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{numMystic:[1]}){results{...AxieBrief}}"+
                "mystic2:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{numMystic:[2]}){results{...AxieBrief}}"+
                "mystic3:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{numMystic:[3]}){results{...AxieBrief}}"+
                "mystic4:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{numMystic:[4]}){results{...AxieBrief}}"+
                "meo1:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{title:[\"MEO Corp\"]}){results{...AxieBrief}}"+
                "meo2:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{title:[\"MEO Corp II\"]}){results{...AxieBrief}}"+
                "japan:axies(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{region:\"japan\"}){results{...AxieBrief}}}"+
                "fragment AxieBrief on Axie{auction{currentPrice,currentPriceUSD}}"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        console.log(data);
        FloorPrices.push({Type:"Axie", Category:"Normal", Price:PriceDisplayHuman(data.data.normal.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Japanese", Price:PriceDisplayHuman(data.data.japan.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Origin", Price:PriceDisplayHuman(data.data.origin.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Mystic1", Price:PriceDisplayHuman(data.data.mystic1.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Mystic2", Price:PriceDisplayHuman(data.data.mystic2.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Mystic3", Price:PriceDisplayHuman(data.data.mystic3.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Mystic4", Price:PriceDisplayHuman(data.data.mystic4.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Meo1", Price:PriceDisplayHuman(data.data.meo1.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Axie", Category:"Meo2", Price:PriceDisplayHuman(data.data.meo2.results[0].auction.currentPrice)});

        console.log(FloorPrices);
    });

    //Query entire land floor data
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetLandsGrid",
            "query":"query GetLandsGrid{"+
                "genesis:lands(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{landType:[Genesis]}){results{...LandBriefV2}}"+
                "mystic:lands(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{landType:[Mystic]}){results{...LandBriefV2}}"+
                "arctic:lands(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{landType:[Arctic]}){results{...LandBriefV2}}"+
                "forest:lands(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{landType:[Forest]}){results{...LandBriefV2}}"+
                "savannah:lands(auctionType:Sale,from:0,size:1,sort:PriceAsc,criteria:{landType:[Savannah]}){results{...LandBriefV2}}}"+
                "fragment LandBriefV2 on LandPlot{auction{currentPrice}}"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        console.log(data);
        FloorPrices.push({Type:"Land", Category:"Genesis", Price:PriceDisplayHuman(data.data.genesis.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Land", Category:"Mystic", Price:PriceDisplayHuman(data.data.mystic.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Land", Category:"Arctic", Price:PriceDisplayHuman(data.data.arctic.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Land", Category:"Forest", Price:PriceDisplayHuman(data.data.forest.results[0].auction.currentPrice)});
        FloorPrices.push({Type:"Land", Category:"Savannah", Price:PriceDisplayHuman(data.data.savannah.results[0].auction.currentPrice)});

        console.log(FloorPrices);
    });

    //Query Item Floors
    //ItemMysticPrice
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetItemBriefList","variables":{"from":0,"size":1,"sort":"PriceAsc","owner":null,"auctionType":"Sale","criteria":{"landType":[],"rarity":["Mystic"],"itemAlias":[]}},
            "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  currentPrice\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        FloorPrices.push({Type:"Item", Category:"Mystic", Price:PriceDisplayHuman(data.data.items.results[0].auction.currentPrice)});
    });

    //ItemEpicPrice
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetItemBriefList","variables":{"from":0,"size":1,"sort":"PriceAsc","owner":null,"auctionType":"Sale","criteria":{"landType":[],"rarity":["Epic"],"itemAlias":[]}},
            "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  currentPrice\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        FloorPrices.push({Type:"Item", Category:"Epic", Price:PriceDisplayHuman(data.data.items.results[0].auction.currentPrice)});
    });

    //ItemRarePrice
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetItemBriefList","variables":{"from":0,"size":1,"sort":"PriceAsc","owner":null,"auctionType":"Sale","criteria":{"landType":[],"rarity":["Rare"],"itemAlias":[]}},
            "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  currentPrice\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        FloorPrices.push({Type:"Item", Category:"Rare", Price:PriceDisplayHuman(data.data.items.results[0].auction.currentPrice)});
    });

    //ItemCommonPrice
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetItemBriefList","variables":{"from":0,"size":1,"sort":"PriceAsc","owner":null,"auctionType":"Sale","criteria":{"landType":[],"rarity":["Common"],"itemAlias":[]}},
            "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  currentPrice\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        FloorPrices.push({Type:"Item", Category:"Common", Price:PriceDisplayHuman(data.data.items.results[0].auction.currentPrice)});
    });
    PriceWriter();
}

function PriceWriter() {
    for(i=0; i < FloorPrices.length; i++) {
        document.getElementById(FloorPrices[i].Type+FloorPrices[i].Category+"Price").innerHTML = FloorPrices[i].Price+ " ETH";
    }
}

function SelectAddress() {

    ETHWalletAxie = [];
    ETHWalletLand = [];
    ETHWalletItem = [];

    document.getElementById("ETHAddress").innerHTML = txt;
    var L = document.getElementById("lds-hourglass");
  
    var txt;
    var PopUp = prompt("Please enter your ETH (0x...) or Ronin (ronin:...) Address with your Axies:", "0x.../ronin:...");
    if (PopUp == null || PopUp == "") {
        txt = "User cancelled the prompt!";
    } else if (PopUp.startsWith("0x") && PopUp.length == 42) {
        txt = PopUp;
        document.getElementById("ETHAddress").innerHTML = txt;
        GetAccountData(txt,"ETH");

        L.style.display = "inline-block";
    } else if (PopUp.startsWith("ronin:") && PopUp.length == 46) {
        txt = PopUp;
        document.getElementById("ETHAddress").innerHTML = txt;
        GetAccountData(txt,"Ronin");

        L.style.display = "inline-block";
    } else {
        txt = "Please enter a real ETH Address";
    }
    
}

async function GetAccountData(ETHAddy, AddressType) {
    var RoninAddy = null;
    var url = "https://graphql-gateway.axieinfinity.com/graphql";

    if(AddressType == "ETH") {
        //Query Ronin address and Profile Name
        await  fetch(url, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            },
                
            body: JSON.stringify({
                "operationName":"GetProfileByEthAddress","variables":{"ethereumAddress":ETHAddy},
                "query":"query GetProfileByEthAddress($ethereumAddress: String!) {\n  publicProfileWithEthereumAddress(ethereumAddress: $ethereumAddress) {\n    ...Profile\n    __typename\n  }\n}\n\nfragment Profile on PublicProfile {\n  accountId\n  name\n  addresses {\n    ...Addresses\n    __typename\n  }\n  __typename\n}\n\nfragment Addresses on NetAddresses {\n  ethereum\n  tomo\n  loom\n  ronin\n  __typename\n}\n"})
        })
        .then(function(response) { 
            return response.json(); 
        })
            
        .then(function(data) {
            try {
                RoninAddy = data.data.publicProfileWithEthereumAddress.addresses.ronin;
                console.log(RoninAddy);
            }
            catch {
                RoninAddy = "Fail"
                alert("No Ronin wallet could be found!");
            }
        });
    } else if(AddressType == "Ronin") {
        RoninAddy = ETHAddy.replace("ronin:","0x");
        console.log(RoninAddy);
    }

    //NormalAxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":null,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Normal", Amount:data.data.axies.total});
    });

    //JapaneseAxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"region":"japan","stages":null,"numMystic":null,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Japanese", Amount:data.data.axies.total});
    });

    //OriginAxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":null,"pureness":null,"title":["Origin"],"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Origin", Amount:data.data.axies.total});
    });

    //MEO1AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":null,"pureness":null,"title":["MEO Corp"],"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Meo1", Amount:data.data.axies.total});
    });

    //MEO2AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":null,"pureness":null,"title":["MEO Corp II"],"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Meo2", Amount:data.data.axies.total});
    });

    //Mystic1AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":1,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Mystic1", Amount:data.data.axies.total});
    });

    //Mystic2AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":2,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Mystic2", Amount:data.data.axies.total});
    });

    //Mystic3AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":3,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Mystic3", Amount:data.data.axies.total});
    });

    //Mystic4AxieAmount
    await  fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
            
        body: JSON.stringify({
            "operationName":"GetAxieBriefList","variables":{"from":0,"size":0,"sort":"IdDesc","auctionType":"All","owner":RoninAddy,"criteria":{"parts":null,"bodyShapes":null,"classes":null,"stages":null,"numMystic":4,"pureness":null,"title":null,"breedable":null,"breedCount":null,"hp":[],"skill":[],"speed":[],"morale":[]}},
            "query":"query GetAxieBriefList($auctionType: AuctionType,  $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n    __typename\n}\n"})
    })
    .then(function(response) { 
        return response.json(); 
    })
        
    .then(function(data) {
        ETHWalletAxie.push({Type:"Axie", Category:"Mystic4", Amount:data.data.axies.total});
    });

    //substracts all other Axies from the normal category, normal Axies need to be index 0!!
    var SubstractNormal = null;
    //5 because substracting mystics is wrong, since they already got substracted with the origins
    for(i=1; i < 5; i++) {
        SubstractNormal = SubstractNormal + ETHWalletAxie[i].Amount;
    }
    ETHWalletAxie[0].Amount = ETHWalletAxie[0].Amount - SubstractNormal;

    //substracts all mystic Axies from the Origin category, normal Axies need to be index 0!!
    var SubstractOrigin = null;
    for(j=5; j < ETHWalletAxie.length; j++) {
        SubstractOrigin = SubstractOrigin + ETHWalletAxie[j].Amount;
    }
    ETHWalletAxie[2].Amount = ETHWalletAxie[2].Amount - SubstractOrigin;

    //Query Land from the address
    var TotalLand = 1;
        var From = 0;
        var LandGridOwner = [];

        for(L = 0; L < TotalLand; L++) {
            await  fetch(url, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                },
                    
                body: JSON.stringify({
                    "operationName":"GetLandsGrid","variables":{"from":From,"size":6000,"sort":"Latest","auctionType":"All","owner":RoninAddy,
                    "criteria":{"landType":[]}},"query":"query GetLandsGrid($from: Int!, $size: Int!, $sort: SortBy!, $owner: String, $criteria: LandSearchCriteria, $auctionType: AuctionType) {\n  lands(criteria: $criteria, from: $from, size: $size, sort: $sort, owner: $owner, auctionType: $auctionType) {\n    total\n    results {\n      ...LandBriefV2\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment LandBriefV2 on LandPlot {\n  landType\n  row\n  col\n    __typename\n}\n"})
            })
            .then(function(response) { 
                return response.json(); 
            })
                
            .then(function(data) {
                LandGridOwner.push(data);
                From = From + 100;
                if(data.data.lands.total - From > TotalLand) {
                    TotalLand = TotalLand +1;
                } else {
                    for(k=0; k<TotalLand; k++) {
                        for(m=0; m<LandGridOwner[k].data.lands.results.length; m++) {
                            ETHWalletLand.push(LandGridOwner[k].data.lands.results[m]);
                        }
                    }
                }
            });
        }

        //Query Items from the address
        //MysticItemPrice
        await  fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
                
            body: JSON.stringify({
                "operationName":"GetItemBriefList","variables":{"from":0,"size":0,"sort":"PriceAsc","owner":RoninAddy,"auctionType":"All","criteria":{"landType":[],"rarity":["Mystic"],"itemAlias":[]}},
                "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    total\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  itemId\n  tokenType\n  tokenId\n  itemId\n  landType\n  name\n  itemAlias\n  rarity\n  figureURL\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  startingPrice\n  endingPrice\n  startingTimestamp\n  endingTimestamp\n  duration\n  timeLeft\n  currentPrice\n  currentPriceUSD\n  suggestedPrice\n  seller\n  listingIndex\n  __typename\n}\n"})
        })
        .then(function(response) { 
            return response.json(); 
        })
            
        .then(function(data) {
            ETHWalletItem.push({Type:"Item", Category:"Mystic", Amount:data.data.items.total});
        });
    
        //ItemEpicPrice
        await  fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
                
            body: JSON.stringify({
                "operationName":"GetItemBriefList","variables":{"from":0,"size":0,"sort":"PriceAsc","owner":RoninAddy,"auctionType":"All","criteria":{"landType":[],"rarity":["Epic"],"itemAlias":[]}},
                "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    total\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  itemId\n  tokenType\n  tokenId\n  itemId\n  landType\n  name\n  itemAlias\n  rarity\n  figureURL\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  startingPrice\n  endingPrice\n  startingTimestamp\n  endingTimestamp\n  duration\n  timeLeft\n  currentPrice\n  currentPriceUSD\n  suggestedPrice\n  seller\n  listingIndex\n  __typename\n}\n"})
        })
        .then(function(response) { 
            return response.json(); 
        })
            
        .then(function(data) {
            ETHWalletItem.push({Type:"Item", Category:"Epic", Amount:data.data.items.total});
        });
    
        //ItemRarePrice
        await  fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
                
            body: JSON.stringify({
                "operationName":"GetItemBriefList","variables":{"from":0,"size":0,"sort":"PriceAsc","owner":RoninAddy,"auctionType":"All","criteria":{"landType":[],"rarity":["Rare"],"itemAlias":[]}},
                "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    total\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  itemId\n  tokenType\n  tokenId\n  itemId\n  landType\n  name\n  itemAlias\n  rarity\n  figureURL\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  startingPrice\n  endingPrice\n  startingTimestamp\n  endingTimestamp\n  duration\n  timeLeft\n  currentPrice\n  currentPriceUSD\n  suggestedPrice\n  seller\n  listingIndex\n  __typename\n}\n"})
        })
        .then(function(response) { 
            return response.json(); 
        })
            
        .then(function(data) {
            ETHWalletItem.push({Type:"Item", Category:"Rare", Amount:data.data.items.total});
        });
    
        //ItemCommonPrice
        await  fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
                
            body: JSON.stringify({
                "operationName":"GetItemBriefList","variables":{"from":0,"size":0,"sort":"PriceAsc","owner":RoninAddy,"auctionType":"All","criteria":{"landType":[],"rarity":["Common"],"itemAlias":[]}},
                "query":"query GetItemBriefList($from: Int, $size: Int, $sort: SortBy, $auctionType: AuctionType, $owner: String, $criteria: ItemSearchCriteria) {\n  items(from: $from, size: $size, sort: $sort, auctionType: $auctionType, owner: $owner, criteria: $criteria) {\n    total\n    results {\n      ...ItemBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ItemBrief on LandItem {\n  itemId\n  tokenType\n  tokenId\n  itemId\n  landType\n  name\n  itemAlias\n  rarity\n  figureURL\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  startingPrice\n  endingPrice\n  startingTimestamp\n  endingTimestamp\n  duration\n  timeLeft\n  currentPrice\n  currentPriceUSD\n  suggestedPrice\n  seller\n  listingIndex\n  __typename\n}\n"})
        })
        .then(function(response) { 
            return response.json(); 
        })
            
        .then(function(data) {
            ETHWalletItem.push({Type:"Item", Category:"Common", Amount:data.data.items.total});
        });

        AmountWriter();
}

function AmountWriter() {

    for(i=0; i < ETHWalletAxie.length; i++) {
        document.getElementById(ETHWalletAxie[i].Type+ETHWalletAxie[i].Category+"Amount").innerHTML = ETHWalletAxie[i].Amount+ " Axies";
    }

    for(i=0; i < ETHWalletItem.length; i++) {
        document.getElementById(ETHWalletItem[i].Type+ETHWalletItem[i].Category+"Amount").innerHTML = ETHWalletItem[i].Amount+ " Pieces";
    }

    var GenNum = 0;
    var MysNum = 0;
    var ArcNum = 0;
    var ForNum = 0;
    var SavNum = 0;
    for(p=0; p < ETHWalletLand.length; p++) {
        if(ETHWalletLand[p].landType == "Genesis") {
            GenNum = GenNum + 1;
        } else if(ETHWalletLand[p].landType == "Mystic") {
            MysNum = MysNum + 1;
        } else if(ETHWalletLand[p].landType == "Arctic") {
            ArcNum = ArcNum + 1;
        } else if(ETHWalletLand[p].landType == "Forest") {
            ForNum = ForNum + 1;
        } else if(ETHWalletLand[p].landType == "Savannah") {
            SavNum = SavNum + 1;
        }
    }
    document.getElementById("LandGenesisAmount").innerHTML = GenNum + " Plots";
    document.getElementById("LandMysticAmount").innerHTML = MysNum + " Plots";
    document.getElementById("LandArcticAmount").innerHTML = ArcNum + " Plots";
    document.getElementById("LandForestAmount").innerHTML = ForNum + " Plots";
    document.getElementById("LandSavannahAmount").innerHTML = SavNum + " Plots";

    //Worth amount calc
    document.getElementById("AxieNormalWorth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieNormalPrice").innerHTML) * parseInt(document.getElementById("AxieNormalAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieJapaneseWorth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieJapanesePrice").innerHTML) * parseInt(document.getElementById("AxieJapaneseAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieOriginWorth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieOriginPrice").innerHTML) * parseInt(document.getElementById("AxieOriginAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMeo1Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMeo1Price").innerHTML) * parseInt(document.getElementById("AxieMeo1Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMeo2Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMeo2Price").innerHTML) * parseInt(document.getElementById("AxieMeo2Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMystic1Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMystic1Price").innerHTML) * parseInt(document.getElementById("AxieMystic1Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMystic2Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMystic2Price").innerHTML) * parseInt(document.getElementById("AxieMystic2Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMystic3Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMystic3Price").innerHTML) * parseInt(document.getElementById("AxieMystic3Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("AxieMystic4Worth").innerHTML = Math.round(((parseFloat(document.getElementById("AxieMystic4Price").innerHTML) * parseInt(document.getElementById("AxieMystic4Amount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";

    document.getElementById("LandGenesisWorth").innerHTML = Math.round(((parseFloat(document.getElementById("LandGenesisPrice").innerHTML) * parseInt(document.getElementById("LandGenesisAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("LandMysticWorth").innerHTML = Math.round(((parseFloat(document.getElementById("LandMysticPrice").innerHTML) * parseInt(document.getElementById("LandMysticAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("LandArcticWorth").innerHTML = Math.round(((parseFloat(document.getElementById("LandArcticPrice").innerHTML) * parseInt(document.getElementById("LandArcticAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("LandForestWorth").innerHTML = Math.round(((parseFloat(document.getElementById("LandForestPrice").innerHTML) * parseInt(document.getElementById("LandForestAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("LandSavannahWorth").innerHTML = Math.round(((parseFloat(document.getElementById("LandSavannahPrice").innerHTML) * parseInt(document.getElementById("LandSavannahAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";

    document.getElementById("ItemMysticWorth").innerHTML = Math.round(((parseFloat(document.getElementById("ItemMysticPrice").innerHTML) * parseInt(document.getElementById("ItemMysticAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("ItemEpicWorth").innerHTML = Math.round(((parseFloat(document.getElementById("ItemEpicPrice").innerHTML) * parseInt(document.getElementById("ItemEpicAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("ItemRareWorth").innerHTML = Math.round(((parseFloat(document.getElementById("ItemRarePrice").innerHTML) * parseInt(document.getElementById("ItemRareAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    document.getElementById("ItemCommonWorth").innerHTML = Math.round(((parseFloat(document.getElementById("ItemCommonPrice").innerHTML) * parseInt(document.getElementById("ItemCommonAmount").innerHTML)) + Number.EPSILON) * 10000) / 10000 + " ETH";
    
    //Adding up all the values for a total

    var AxieWorth = parseFloat(document.getElementById("AxieNormalWorth").innerHTML) + parseFloat(document.getElementById("AxieJapaneseWorth").innerHTML) + parseFloat(document.getElementById("AxieOriginWorth").innerHTML) + parseFloat(document.getElementById("AxieMeo1Worth").innerHTML) + parseFloat(document.getElementById("AxieMeo2Worth").innerHTML) + parseFloat(document.getElementById("AxieMystic1Worth").innerHTML) + parseFloat(document.getElementById("AxieMystic2Worth").innerHTML) + parseFloat(document.getElementById("AxieMystic3Worth").innerHTML) + parseFloat(document.getElementById("AxieMystic4Worth").innerHTML);
    AxieWorth = Math.round((AxieWorth + Number.EPSILON) * 10000) / 10000
    document.getElementById("EntireAxieWorth").innerHTML = "Calculated Worth of all Axies = " + AxieWorth + " ETH";
    GesamtWertAxie = AxieWorth;

    var LandWorth = parseFloat(document.getElementById("LandGenesisWorth").innerHTML) + parseFloat(document.getElementById("LandMysticWorth").innerHTML) + parseFloat(document.getElementById("LandArcticWorth").innerHTML) + parseFloat(document.getElementById("LandForestWorth").innerHTML) + parseFloat(document.getElementById("LandSavannahWorth").innerHTML);
    LandWorth = Math.round((LandWorth + Number.EPSILON) * 10000) / 10000
    document.getElementById("EntireLandWorth").innerHTML = "Calculated Worth of all Landplots = " + LandWorth + " ETH";

    var ItemWorth = parseFloat(document.getElementById("ItemMysticWorth").innerHTML) + parseFloat(document.getElementById("ItemEpicWorth").innerHTML) + parseFloat(document.getElementById("ItemRareWorth").innerHTML) + parseFloat(document.getElementById("ItemCommonWorth").innerHTML);
    ItemWorth = Math.round((ItemWorth + Number.EPSILON) * 10000) / 10000
    document.getElementById("EntireItemWorth").innerHTML = "Calculated Worth of all Items = " + ItemWorth + " ETH";
    GesamtWertItem = ItemWorth;

    var EntireWorth = AxieWorth + LandWorth + ItemWorth;
    EntireWorth = Math.round((EntireWorth + Number.EPSILON) * 10000) / 10000
    document.getElementById("EntireAccountWorth").style.display = "block";
    document.getElementById("EntireAccountWorth").innerHTML = "This Address is worth " + EntireWorth + " ETH";

    AddMultipliers(ETHWalletLand);
    AdvancedEstateCalc();
    
    var L = document.getElementById("lds-hourglass");
    L.style.display = "none";
}

function AdvancedEstateCalc() {

    timeout(3000);
    
    var GenesisTempArray = [];
    var MysticTempArray = [];
    var ArcticTempArray = [];
    var ForestTempArray = [];
    var SavannahTempArray = [];

    var EstateArray = [];

    for(i=0; i < ETHWalletLand.length; i++) {
        if(ETHWalletLand[i].landType == "Genesis") {
            GenesisTempArray.push(ETHWalletLand[i]);
        } else if(ETHWalletLand[i].landType == "Mystic") {
            MysticTempArray.push(ETHWalletLand[i]);
        } else if(ETHWalletLand[i].landType == "Arctic") {
            ArcticTempArray.push(ETHWalletLand[i]);
        } else if(ETHWalletLand[i].landType == "Forest") {
            ForestTempArray.push(ETHWalletLand[i]);
        } else if(ETHWalletLand[i].landType == "Savannah") {
            SavannahTempArray.push(ETHWalletLand[i]);
        }
    }

    if(GenesisTempArray.length > 8) {
        EstateArrayMaker(GenesisTempArray, EstateArray);
    }
    if(MysticTempArray.length > 8) {
        EstateArrayMaker(MysticTempArray, EstateArray);
    }
    if(ArcticTempArray.length > 8) {
        EstateArrayMaker(ArcticTempArray, EstateArray);
    }
    if(ForestTempArray.length > 8) {
        EstateArrayMaker(ForestTempArray, EstateArray);
    }
    if(SavannahTempArray.length > 8) {
        EstateArrayMaker(SavannahTempArray, EstateArray);
    }

    //sorts according to land and then size
    var TempSortArray = EstateArray;
    TempSortArray.sort(function (a, b) {
        return b.length - a.length;
    });

    EstateArray = [];

    var TempSortVariable = 0;
    for(m=0; m < 5; m++) {
        if(m == 0) {
            TempSortVariable = "Genesis";
        } else if(m == 1) {
            TempSortVariable = "Mystic";
        } else if(m == 2) {
            TempSortVariable = "Arctic";
        } else if(m == 3) {
            TempSortVariable = "Forest";
        } else if(m == 4) {
            TempSortVariable = "Savannah";
        }

        for(n=0; n < TempSortArray.length; n++) {
            if(TempSortArray[n][0].landType == TempSortVariable) {
                EstateArray.push(TempSortArray[n]);
            }
        }
    }
    //sorting finished

    //Single advanced Plot Prices
    var NonEstatePlots = JSON.parse(JSON.stringify(ETHWalletLand));

    for(a=0; a < ETHWalletLand.length; a++) {
        for(s=0; s < EstateArray.length; s++) {
            for(d=0; d < EstateArray[s].length; d++) {
                if(EstateArray[s][d].row == ETHWalletLand[a].row && EstateArray[s][d].col == ETHWalletLand[a].col) {
                    delete NonEstatePlots[a];
                    break;
                }
            }
        }
    }
    NonEstatePlots = NonEstatePlots.filter(function (el) {
        return el != null;
    });

    NonEstatePlots.sort(function (a, b) {
        return b.landType - a.landType;
    });

    TediouslyWritenUIWriter(NonEstatePlots);

    for(p=0; p < EstateArray.length; p++) {
        DisplayEstateWriter(EstateArray[p]);
    }
    
    EndRechner();
}

function EstateArrayMaker(Array, EstateArray) {
    var CoordArray = JSON.parse(JSON.stringify(Array));
    var TempArray = [];
    
    for(i=0; i<Array.length; i++) {
        if(Array[i].row == CoordArray[i].row) {
            TempArray.push(Array[i])
            CoordArray[i].row = 999;
        }

        try{for(j=0; j<Array.length; j++) {
            for(k=0; k<Array.length; k++) {
                if(TempArray[j].row -1 == Array[k].row && TempArray[j].col -1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row == Array[k].row && TempArray[j].col -1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row +1 == Array[k].row && TempArray[j].col -1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row -1 == Array[k].row && TempArray[j].col == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row +1 == Array[k].row && TempArray[j].col == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row -1 == Array[k].row && TempArray[j].col +1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row == Array[k].row && TempArray[j].col +1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
                if(TempArray[j].row +1 == Array[k].row && TempArray[j].col +1 == Array[k].col && CoordArray[k].row == Array[k].row) {
                    TempArray.push(Array[k]);
                    CoordArray[k].row = 999;
                }
            }
            if(j==TempArray.length-1) {
                break;
            }
        }} catch{}
        if(TempArray.length > 8) {
            EstateArray.push(JSON.parse(JSON.stringify(TempArray)));
            TempArray = [];
        } else {
            TempArray = [];
        }
    }

    return EstateArray;
}

var CanvasCounter = 0;
function DisplayEstateWriter(SingleEstateArray) {

    CanvasCounter = CanvasCounter + 1;
    var EstateSize = SingleEstateArray.length;
    var EstateSizeCategory = null;
    var EstatePrice = 0;

    if(EstateSize > 99) {     //XXL Estate
        EstateSizeCategory = "XXL";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    } else if(EstateSize > 49) { //XL Estate
        EstateSizeCategory = "XL";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    } else if(EstateSize > 35) { //L Estate
        EstateSizeCategory = "L";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    } else if(EstateSize > 24) { //M Estate
        EstateSizeCategory = "M";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    } else if(EstateSize > 15) { //MS Estate
        EstateSizeCategory = "MS";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    } else if(EstateSize > 8) { //S Estate
        EstateSizeCategory = "S";
        EstatePrice = CocoMultiAnwender(SingleEstateArray, SingleEstateArray[0].landType, EstateSizeCategory);
    }

    var div1 = document.createElement("DIV");
    div1.className = "CategoryAxie";
    div1.id = "LandType1" + SingleEstateArray[0].landType;
    div1.textContent = SingleEstateArray[0].landType;
    document.getElementById("DatacontainerEstate").appendChild(div1);

    DynamicEstateRemover.push("LandType1" + SingleEstateArray[0].landType);

    var div2 = document.createElement("DIV");
    div2.className = "CategoryAxie";
    div2.id = "LandType2" + SingleEstateArray[0].landType;
    div2.textContent = EstateSizeCategory;
    document.getElementById("DatacontainerEstate").appendChild(div2);

    DynamicEstateRemover.push("LandType2" + SingleEstateArray[0].landType);

    var div3 = document.createElement("DIV");
    div3.className = "CategoryFloorPriceAxie";
    div3.id = "LandType3" + SingleEstateArray[0].landType;
    div3.textContent = EstateSize;
    document.getElementById("DatacontainerEstate").appendChild(div3);

    DynamicEstateRemover.push("LandType3" + SingleEstateArray[0].landType);

    var div4 = document.createElement("DIV");
    div4.className = "CategoryFloorPriceAxie";
    div4.id = "LandType4" + SingleEstateArray[0].landType;
    div4.textContent = EstatePrice;
    document.getElementById("DatacontainerEstate").appendChild(div4);

    DynamicEstateRemover.push("LandType4" + SingleEstateArray[0].landType);

    var canvas = document.createElement("CANVAS");
    canvas.className = "CanvasMap";
    canvas.id = "MyCanvas" + CanvasCounter;
    canvas.width = 50;
    canvas.height = 50;
    document.getElementById("DatacontainerEstate").appendChild(canvas);

    GenerateMap(SingleEstateArray, CanvasCounter);

    DynamicEstateRemover.push("MyCanvas" + CanvasCounter);

    EntireEstatePrice = EntireEstatePrice + EstatePrice;
}

//Adds Multipliers to ETHWalletLand
function AddMultipliers(Array) {

    var TempArray5 = [];
    //Landgridall with multipliers to Array (>SortedLandGridOwner) that has the plots from the account but not the multiplier and put it into the OwnerestateArray
    for(i=0; i<Array.length; i++) {
        for(j=0; j<LandGridAll.length; j++) {
            if(Array[i].row == LandGridAll[j].row && Array[i].col == LandGridAll[j].col) {
                TempArray5.push(LandGridAll[j]);
                break;
            }
        }
    }

    TempArray5.map( s => {
        if ( s.hasOwnProperty("LandType") )
        {
           s.landType = s.LandType;
           delete s.LandType;   
        }
        return s;
      })

    ETHWalletLand = TempArray5;
    return;
}

// Array = Estate / LandType = "Forest" for example / LandSize = "XL" for example
function CocoMultiAnwender(Array, LandTyp, LandSize) {

    var GrundPreis = null;
    for(Q=0; Q < FloorPrices.length; Q++) {
        if(LandTyp == FloorPrices[Q].Category) {
            GrundPreis = FloorPrices[Q].Price;
            break;
        }
    }

    var FaktPreis = 0;

    var RiverPlots = 0;
    var NodePlots = 0;
    var RoadPlots = 0;
    var Inside = 1;

    var ESize = 1

    if(LandSize == "XXL") {
        ESize = 3;
    } else if(LandSize == "XL") {
        ESize = 2.5;
    } else if(LandSize == "L") {
        ESize = 1.8;
    } else if(LandSize == "M") {
        ESize = 1.6;
    } else if(LandSize == "MS") {
        ESize = 1.4;
    } else if(LandSize == "S") {
        ESize = 1.2;
    }

    for(i=0; i<Array.length; i++) {
        if(Array[i].NextToNode == "Yes" && Array[i].landType != "Genesis") {
            NodePlots++;
        }
        if(Array[i].NextToRiver == "Yes" && Array[i].landType != "Genesis") {
            RiverPlots++;
        }
        if(Array[i].NextToRoad == "Yes") {
            RoadPlots++;
        }
    }
    if(Array[0].InsideRiver == "Yes" && Array[0].landType != "Genesis" && Array[0].landType != "Mystic") {
        if(Array[0].landType == "Arctic") {
            Inside = 1.3;
        } else {
            Inside = 1.5;
        }
    }

    FaktPreis = (GrundPreis * (Array.length - RiverPlots - NodePlots - RoadPlots + RiverPlots * RiverMulti + NodePlots * NodeMulti + RoadPlots * RoadMulti)) * Inside * ESize;
    FaktPreis = Math.round((FaktPreis + Number.EPSILON) * 10000) / 10000;

    return FaktPreis;
}

function TediouslyWritenUIWriter(NonEstateArray) {

    var FinSinglePLotArray = [];
    var GenTemp = 0;
    var ArcTemp = 0;
    var MysTemp = 0;
    var ForTemp = 0;
    var SavTemp = 0;
    var GenPreisTemp = 0;
    var ArcPreisTemp = 0;
    var MysPreisTemp = 0;
    var ForPreisTemp = 0;
    var SavPreisTemp = 0;
    var TempGrundPreis = 0;
    var TempFloorName = null;
    var TempFaktPreis = 0;
    var NodeYN = 0;
    var RiverYN = 0;
    var RoadYN = 0;
    var InsideYN = 0;

    for(m=0; m<NonEstateArray.length; m++) {
        TempFloorName = "Land"+NonEstateArray[m].landType+"Price";
        for(Q=0; Q < FloorPrices.length; Q++) {
            if(NonEstateArray[m].landType == FloorPrices[Q].Category) {
                TempGrundPreis = FloorPrices[Q].Price;
                break;
            }
        }

        if(NonEstateArray[m].InsideRiver == "Yes" && NonEstateArray[m].landType != "Genesis" && NonEstateArray[m].landType != "Mystic" && NonEstateArray[m].landType != "Arctic") {
            InsideYN = 1.5;
        } else if(NonEstateArray[m].landType == "Arctic"){
            InsideYN = 1.3;
        } else {
            InsideYN = 1;
        }
        if(NonEstateArray[m].NextToNode == "Yes") {
            NodeYN = NodeMulti;
        } else {
            NodeYN = 1;
        }
        if(NonEstateArray[m].NextToRiver == "Yes" && NonEstateArray[m].landType != "Genesis") {
            RiverYN = RiverMulti;
        } else {
            RiverYN = 1;
        }
        if(NonEstateArray[m].NextToRoad == "Yes") {
            RoadYN = RoadMulti;
        } else {
            RoadYN = 1;
        }

        TempFaktPreis = (TempGrundPreis * (1  * NodeYN * RiverYN * RoadYN)) * InsideYN;

        if(NonEstateArray[m].landType == "Genesis") {
            GenPreisTemp = GenPreisTemp + TempFaktPreis;
            GenTemp++;
        }
        if(NonEstateArray[m].landType == "Mystic") {
            MysPreisTemp = MysPreisTemp + TempFaktPreis;
            MysTemp++;
        }
        if(NonEstateArray[m].landType == "Arctic") {
            ArcPreisTemp = ArcPreisTemp + TempFaktPreis;
            ArcTemp++;
        }
        if(NonEstateArray[m].landType == "Forest") {
            ForPreisTemp = ForPreisTemp + TempFaktPreis;
            ForTemp++;
        }
        if(NonEstateArray[m].landType == "Savannah") {
            SavPreisTemp = SavPreisTemp + TempFaktPreis;
            SavTemp++;
        }
    }

    if(GenTemp != 0) {
        GenPreisTemp = Math.round((GenPreisTemp + Number.EPSILON) * 10000) / 10000;
        FinSinglePLotArray.push({landType:"Genesis", AmountOfPlots:GenTemp, Price:GenPreisTemp});
    }
    if(MysTemp != 0) {
        MysPreisTemp = Math.round((MysPreisTemp + Number.EPSILON) * 10000) / 10000;
        FinSinglePLotArray.push({landType:"Mystic", AmountOfPlots:MysTemp, Price:MysPreisTemp});
    }
    if(ArcTemp != 0) {
        ArcPreisTemp = Math.round((ArcPreisTemp + Number.EPSILON) * 10000) / 10000;
        FinSinglePLotArray.push({landType:"Arctic", AmountOfPlots:ArcTemp, Price:ArcPreisTemp});
    }
    if(ForTemp != 0) {
        ForPreisTemp = Math.round((ForPreisTemp + Number.EPSILON) * 10000) / 10000;
        FinSinglePLotArray.push({landType:"Forest", AmountOfPlots:ForTemp, Price:ForPreisTemp});
    }
    if(SavTemp != 0) {
        SavPreisTemp = Math.round((SavPreisTemp + Number.EPSILON) * 10000) / 10000;
        FinSinglePLotArray.push({landType:"Savannah", AmountOfPlots:SavTemp, Price:SavPreisTemp});
    }

    for(k=0; k<FinSinglePLotArray.length; k++) {
        //Make fields visible
        var CssStyleSingle = ".Lone" + FinSinglePLotArray[k].landType + "Vis";
        var StackOFSingle = document.querySelectorAll(CssStyleSingle);
        for(var l = 0; l < StackOFSingle.length; l++) {
            StackOFSingle[l].style.display="block";
        }

        //Add the numbers
        var HTMLPlotsSingle = "Land" + FinSinglePLotArray[k].landType + "AdvancedAmount";
        document.getElementById(HTMLPlotsSingle).innerHTML = FinSinglePLotArray[k].AmountOfPlots;

        var HTMLPricesSingle = "Land" + FinSinglePLotArray[k].landType + "AdvancedWorth";
        document.getElementById(HTMLPricesSingle).innerHTML = FinSinglePLotArray[k].Price;
    }

    NonEstatePlotsPrice = FinSinglePLotArray;
}

function EndRechner() {
    var TempValue = 0;

    for(i=0; i<NonEstatePlotsPrice.length; i++) {
        TempValue = TempValue + NonEstatePlotsPrice[i].Price;
    }
    EntireEstatePrice = EntireEstatePrice + TempValue;
    //calculate the entire land worth from the advanced function and that plus Axies and Items
    EntireEstatePrice = Math.round((EntireEstatePrice + Number.EPSILON) * 10000) / 10000;
    document.getElementById("EntireLandAdvancedWorth").innerHTML = "Calculated Worth of all Landplots and Estates = " + EntireEstatePrice + " ETH";

    var EntireWorthAdvanced = GesamtWertAxie + EntireEstatePrice + GesamtWertItem;
    EntireWorthAdvanced = Math.round((EntireWorthAdvanced + Number.EPSILON) * 10000) / 10000;
    document.getElementById("EntireAccountWorthAdvanced").innerHTML = "This Address is worth " + EntireWorthAdvanced + " ETH";

    var all = document.getElementsByClassName("DatConEstate");
    for (var i = 0; i < all.length; i++) {
        all[i].style.display = "grid";
    }

    if(brCheat == 0) {
        var mybr = document.createElement("BR");
        document.getElementById("SimpleFeature").appendChild(mybr);
    }
    brCheat = 1;

    document.getElementById("EditArray").style.display = "block";
}

function GenerateMap(MultiplierArray, CanvasCounter) {
    
    var StartRow = 0;
    var StartCol = 0;
    var EndRow = 0;
    var EndCol = 0;
    var hoch = 0;
    var weit = 0;
    var Infrastructure = [];
    var Scaling = 5;

    MultiplierArray.sort(function (a, b) {
        return a.col - b.col;
    });
    StartCol = MultiplierArray[0].col -2;
    EndCol = MultiplierArray[MultiplierArray.length-1].col +2;

    var a = StartCol - EndCol;
    var b = 0 - 0;

    weit = Math.sqrt( a*a + b*b );

    MultiplierArray.sort(function (a, b) {
        return a.row - b.row;
    });
    StartRow = MultiplierArray[0].row -2;
    EndRow = MultiplierArray[MultiplierArray.length-1].row +2;

    var e = StartRow - EndRow;
    var d = 0 - 0;

    hoch = Math.sqrt( e*e + d*d );

    for(r=0; r < WorldGrid.length; r++) {
        if((WorldGrid[r].LandType == "Road" || WorldGrid[r].LandType == "River" || WorldGrid[r].LandType == "Node") && (WorldGrid[r].col > StartCol && WorldGrid[r].col < EndCol) && (WorldGrid[r].row > StartRow && WorldGrid[r].row < EndRow)) {
            Infrastructure.push(JSON.parse(JSON.stringify(WorldGrid[r])));
        }
    }

    Infrastructure.map( s => {
        if ( s.hasOwnProperty("LandType") )
        {
           s.landType = s.LandType;
           delete s.LandType;   
        }
        return s;
      })

    var c = document.getElementById("MyCanvas" + CanvasCounter);
    c.height = hoch * Scaling;
    c.width = weit * Scaling;
    var ctx = c.getContext("2d");
    ctx.scale(Scaling,Scaling);

    /*
    colorcodes:
        Road: #F9EED4
        River: #2481ED
        Node: #FF6BA3

        Savannah: #FFB70F
        Forest: #C9F13B
        Arctic: #E4FFF6
        Mystic: #6ABBD0
    */

    for(i=0; i<MultiplierArray.length; i++) {
      
      var xCord = MultiplierArray[i].col + StartCol*-1;
      var yCord = MultiplierArray[i].row + StartRow*-1;
  
      if(MultiplierArray[i].landType == "Savannah") {
        ctx.fillStyle = "#FFB70F";
      } else if(MultiplierArray[i].landType == "Forest") {
        ctx.fillStyle = "#C9F13B";
      } else if(MultiplierArray[i].landType == "Arctic") {
        ctx.fillStyle = "#E4FFF6";
      } else if(MultiplierArray[i].landType == "Mystic") {
        ctx.fillStyle = "#6ABBD0";
      } else if(MultiplierArray[i].landType == "Genesis") {
        ctx.fillStyle = "black";
      }
      
      ctx.fillRect(xCord, yCord, 1, 1);
  
    }

    for(i=0; i<Infrastructure.length; i++) {
      
        var xCord = Infrastructure[i].col + StartCol*-1;
        var yCord = Infrastructure[i].row + StartRow*-1;
    
        if(Infrastructure[i].landType == "Road") {
          ctx.fillStyle = "#F9EED4";
        } else if(Infrastructure[i].landType == "River") {
          ctx.fillStyle = "#2481ED";
        } else if(Infrastructure[i].landType == "Node") {
          ctx.fillStyle = "#FF6BA3";
        }
        
        ctx.fillRect(xCord, yCord, 1, 1);
    
      }
      Infrastructure = [];
}

function EditArrayValues() {

    document.getElementById("FormContainer").style.display = "block";

    for(i=0; i<FloorPrices.length; i++) {
        var label = document.createElement("LABEL");
        label.className = "FormLabel";
        label.textContent = "Floor Price " + FloorPrices[i].Category + " " + FloorPrices[i].Type + ":";
        document.getElementById("AdjustForm").appendChild(label);

        var input = document.createElement("INPUT");
        input.className = "InputUser";
        input.id = "IP" + FloorPrices[i].Type + FloorPrices[i].Category; // ie AxieNormal
        input.value = FloorPrices[i].Price;
        document.getElementById("AdjustForm").appendChild(input);
    }
}

function SubmitInput() {
    var AdjustedValueArray = [];

    //checks if only valid values were entered
    for(j=0; j<18; j++) {
        if(isNumeric(document.getElementById("IP"+FloorPrices[j].Type + FloorPrices[j].Category).value)) {
        } else {
            alert("Please only input real numbers \n and only use '.' and not ','");
            return;
        }
    }

    for(i=0; i<18; i++) {
        AdjustedValueArray.push(document.getElementById("IP"+FloorPrices[i].Type + FloorPrices[i].Category).value);
    }

    for(k=0; k<18; k++) {
        FloorPrices[k].Price = AdjustedValueArray[k];
    }

    PriceWriter();

    //need to remove the old dynamically created advanced estate calcs
    //from stackoverflow, necessery to remove the generated labels and inputs
    Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
        for(var i = this.length - 1; i >= 0; i--) {
            if(this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    }

    for(l=0; l<DynamicEstateRemover.length; l++) {
        document.getElementById(DynamicEstateRemover[l]).remove();
    }

    //resetting some global variables
    DynamicEstateRemover = [];
    EntireEstatePrice = 0;
    CanvasCounter = 0;

    AmountWriter();
}

function CancelInput() {
    //from stackoverflow, necessery to remove the generated labels and inputs
    Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
        for(var i = this.length - 1; i >= 0; i--) {
            if(this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    }

    document.getElementById("FormContainer").style.display = "none";
    document.getElementsByClassName("FormLabel").remove();
    document.getElementsByClassName("InputUser").remove();
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}