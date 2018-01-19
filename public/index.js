'use strict';

//list of truckers
//useful for ALL 5 steps
//could be an array of objects that you fetched from api or database
const truckers = [{
    'id': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
    'name': 'les-routiers-bretons',
    'pricePerKm': 0.05,
    'pricePerVolume': 5
}, {
    'id': '165d65ec-5e3f-488e-b371-d56ee100aa58',
    'name': 'geodis',
    'pricePerKm': 0.1,
    'pricePerVolume': 8.5
}, {
    'id': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
    'name': 'xpo',
    'pricePerKm': 0.10,
    'pricePerVolume': 10
}];

//list of current shippings
//useful for ALL steps
//The `price` is updated from step 1 and 2
//The `commission` is updated from step 3
//The `options` is useful from step 4
const deliveries = [{
    'id': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
    'shipper': 'bio-gourmet',
    'truckerId': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
    'distance': 100,
    'volume': 4,
    'options': {
        'deductibleReduction': false
    },
    'price': 0,
    'commission': {
        'insurance': 0,
        'treasury': 0,
        'convargo': 0
    }
}, {
    'id': '65203b0a-a864-4dea-81e2-e389515752a8',
    'shipper': 'librairie-lu-cie',
    'truckerId': '165d65ec-5e3f-488e-b371-d56ee100aa58',
    'distance': 650,
    'volume': 12,
    'options': {
        'deductibleReduction': true
    },
    'price': 0,
    'commission': {
        'insurance': 0,
        'treasury': 0,
        'convargo': 0
    }
}, {
    'id': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
    'shipper': 'otacos',
    'truckerId': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
    'distance': 1250,
    'volume': 30,
    'options': {
        'deductibleReduction': true
    },
    'price': 0,
    'commission': {
        'insurance': 0,
        'treasury': 0,
        'convargo': 0
    }
}];

//list of actors for payment
//useful from step 5
const actors = [{
    'deliveryId': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
    'payment': [{
        'who': 'shipper',
        'type': 'debit',
        'amount': 0
    }, {
        'who': 'trucker',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'insurance',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'treasury',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'convargo',
        'type': 'credit',
        'amount': 0
    }]
}, {
    'deliveryId': '65203b0a-a864-4dea-81e2-e389515752a8',
    'payment': [{
        'who': 'shipper',
        'type': 'debit',
        'amount': 0
    }, {
        'who': 'trucker',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'insurance',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'treasury',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'convargo',
        'type': 'credit',
        'amount': 0
    }]
}, {
    'deliveryId': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
    'payment': [{
        'who': 'shipper',
        'type': 'debit',
        'amount': 0
    }, {
        'who': 'trucker',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'treasury',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'insurance',
        'type': 'credit',
        'amount': 0
    }, {
        'who': 'convargo',
        'type': 'credit',
        'amount': 0
    }]
}];

/*
 * Computing price property for each item on the deliveries list
 * We basically run through the whole list, use a predicate to find the associated trucker and compute the right price
 * Here we also compute the reduction according to the volume ordered and the deductible reduction
 */
for (var obj of deliveries) {
    // Get the right trucker using a predicate
    let trucker = truckers.find(x => x.id == obj.truckerId);

    // Creating a multiplicator in order to decrease the price with respect to the volume ordered
    let mul = 1;
    if(obj.volume > 5)
    {
        mul = 0.9
    }
    else if(obj.volume > 10)
    {
        mul = 0.7
    }
    else if(obj.volume > 25)
    {
        mul = 0.5
    }

    // Computing the object price
    obj.price = obj.distance * trucker.pricePerKm + obj.volume * trucker.pricePerVolume * mul;

    // Creating a new price if the deductible option is set to true, else we keep the same price
    obj.priceDeductible = (obj.options.deductibleReduction) ? (obj.volume) : 0;

}

/**
 * Let's now compute the commission on the shipping price
 */
for(var obj of deliveries)
{
    var commission = 0.30 * obj.price;
    obj.commission.insurance = 0.50 * commission;

    /*
     * We get the value of the treasury by truncating the division of the distance by 500
     * In order to get the number of ranges of 500
     */
     obj.commission.treasury = Math.trunc(obj.distance/500);
     obj.commission.convargo = commission - obj.commission.insurance - obj.commission.treasury;
}

/**
 * Finally, let's pay the actors
 */
for(var act of actors)
{
    // Finding the right delivery
    let delivery = deliveries.find(x => x.id == act.deliveryId);

    // Charging the shipper
    act.payment.find(x => x.who == "shipper").amount = delivery.price + delivery.priceDeductible;

    let commission = 0;
    for(var com in delivery.commission){
        commission += delivery.commission[com];
    }
    
    // Paying the actors
    act.payment.find(x => x.who == "trucker").amount = delivery.price - commission;
    act.payment.find(x => x.who == "treasury").amount = delivery.commission.treasury;
    act.payment.find(x => x.who == "insurance").amount = delivery.commission.insurance;
    act.payment.find(x => x.who == "convargo").amount = delivery.commission.convargo + delivery.priceDeductible;
}

console.log(truckers)
console.log(deliveries)
console.log(actors)
 