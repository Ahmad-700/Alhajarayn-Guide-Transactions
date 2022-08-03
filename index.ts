console.log('hello world!')
let x = 44;
// x = 'd';//error

let y: string;
// y = 4;//error

type myType = 'bold' | 'italic';
let z: myType;
// z = 'bolder'//error




function pow(x: number, y: number, z?: any): number {
    return Math.pow(x, y + z);
}

// let a:string = pow(3,5)//error

interface Person {
    name: string,
    familyName: string,
    nickname: string,
    phone: string[],
    isExecutor: boolean
}
interface Executor {
    name: string,
    familyName: string,
    nickname: string,
    phone: string[],
    // age: Age,
    // rate: Rate,
    academy: string,
    careerOrProduct: string[],
    accountNumber: string[],

}

let arr: [string, boolean];
// arr.push(true)
// arr = [...arr, 'hi'];
// arr.push(5)

let ar: string | number;
ar = 'hi';
ar = 5;
// ar = false;

// let ali = ar**1;
var i = 0;
function ret() {
    return new Promise((resolve, reject) => {
        return resolve(i++);
    })
}

async function main() {
    console.time('promise loop')
    let allPromises = [];
    for (let j = 0; j < 1000; j++) 
        allPromises.push(ret())
    // for await (let r of allPromises)
    //     console.log(r);
    Promise.all(allPromises).then(r => {
        console.table(r);
        console.timeEnd('promise loop');
});
}
main();
