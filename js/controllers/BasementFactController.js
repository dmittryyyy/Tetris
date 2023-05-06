import { Controller } from 'stimulus';

export default class BasementFactController extends Controller {
  allFacts = this.element.querySelectorAll('p');

  connect() {
    this.randomFact();
  }

  randomFact = () => {
    const numberFact = Math.floor(Math.random() * this.allFacts.length);
    this.allFacts.forEach((fact) => {
      fact.classList.remove('show');
    });
    this.allFacts[numberFact].classList.add('show');
  }
}
