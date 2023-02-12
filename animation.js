export function makeButtonsDark(set) {
  if(document.querySelector(".btn-back") !== null) {  
    gsap.to(".border-country, .btn-back", {
      color: "white", 
      backgroundColor: "hsl(209, 23%, 22%)",
      duration: set === true ? 0 : 0.5
    })
  } 
}

export function switchToDark() {
  gsap.to(".navbar, .card, .search, .dropdown-wrapper, .options", {
      backgroundColor: "hsl(209, 23%, 22%)",
      color: "white"
    })
    gsap.to("body", {
      color: "white",
      backgroundColor: "hsl(207, 26%, 17%)"
    })
    makeButtonsDark()
    gsap.to("html", {
      "--input-color": "white"
    })
    const tl = gsap.timeline()
    tl.to(".sun", {
      y: 0
    })
    tl.to(".moon", {
      y: "-103%"
    }, "<")
    tl.set(".moon", {
      y: "103%"
    }) 
}

export function makeInputDark() {
  gsap.set(".search, .dropdown-wrapper, .options", {
      backgroundColor: "hsl(209, 23%, 22%)",
      color: "white"
    })
}

export function makeButtonsWhite() {
  if(document.querySelector(".btn-back") !== null) {
    gsap.to(".border-country, .btn-back", {
      color: "black", 
      backgroundColor: "white"
    }) 
  }
}

export function switchToLight() {
  gsap.to(".navbar, .card, .search, .dropdown-wrapper, .options", {
      backgroundColor: "white",
      color: "black"
    })
    gsap.to("body", {
      color: "black",
      backgroundColor: "white"
    })
    makeButtonsWhite();
    gsap.to("html", {
      "--input-color": "black"
    })
    const tl = gsap.timeline()
    tl.to(".moon", {
      y: 0
    })
    tl.to(".sun", {
      y: "-103%"
    }, "<")
    tl.set(".sun", {
      y: "103%"
    })
}

const observer = new MutationObserver(function(arr) {
	  arr.map((entry) => {
	    animateCards();
	  })
});

export function observeRoot() {
  observer.observe(document.querySelector("#root"), { subtree: false, childList: true });
}
observeRoot();

function animateCards() {
 if(document.querySelector(".card") !== null) {
    gsap.fromTo(".card", {
      opacity: 0,
      y: 15
    }, {
      opacity: 1,
      y: 0,
      stagger: 0.08
    })
  } 
}

export function animateDetailedCards() {
  gsap.fromTo(".detailed-flag, .country-container > div, .border-countries-container", {
    opacity: 0, 
    y: 10
  }, {
    opacity: 1, 
    y: 0, 
    stagger: 0.1
  })
}