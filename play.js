const person = {
    name: 'Hardik',
    age: 34,
    greetings() {
        console.log(this);
        console.log('This is '+this.name);


    }
}

const fetchData = (callback) => {
    console.log("fetching data");
    setTimeout(() => {
        callback("We are done second time!");
    },1500);
}

setTimeout( () => {
    console.log("time to fetch data");
    fetchData((text) => {
        console.log(text);
    });
}, 
2000);

console.log("We are done defining it!");