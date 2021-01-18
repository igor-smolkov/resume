import './card.scss'

export default class Card {
    constructor() {
        this.elementsCard = document.querySelectorAll('.card');
        this.elementsCardFrontside = document.querySelector('.card_frontside');
        this.elementsCardBackside = document.querySelector('.card_backside');

        this.draggingElementCard = null;

        this.elementsContactToCopy = this.elementsCardFrontside.querySelectorAll('a[href="copy/"'); //elementsCardFrontside только для одной!
        this.elementsContactToCopy.forEach(elementContactToCopy => {
            elementContactToCopy.addEventListener('click', (e)=>{this.clickToCopy(e)});
        });

        this.elementsCard.forEach(elementCard => {
            elementCard.addEventListener('pointerdown', (e)=>{this.onPointerDown(e)});
            document.addEventListener('pointermove', (e)=>{this.onPointerMove(e)});
            document.addEventListener('pointerup', (e)=>{this.onPointerUp(e)});
        })
        // this.elementCard.ondragstart = function() { return false; };
    }
    onPointerDown(e) {
        // if (!e.target.classList.contains('card')) return;
        this.draggingElementCard = e.target.closest('.card'); //сделать уголок для перемещения
        if (this.draggingElementCard !== null) {
            this.draggingElementCard.dataset.shiftX = e.clientX - this.draggingElementCard.getBoundingClientRect().left +34;
            this.draggingElementCard.dataset.shiftY = e.clientY - this.draggingElementCard.getBoundingClientRect().top +30;
            this.draggingElementCard.classList.add('card_dragged');
        }
    }
    onPointerMove(e) {
        if (this.draggingElementCard !== null) {
            this.draggingElementCard.style.left = e.pageX - this.draggingElementCard.dataset.shiftX + 'px';
            this.draggingElementCard.style.top = e.pageY - this.draggingElementCard.dataset.shiftY + 'px';
        }
    }
    onPointerUp(e) {
        this.draggingElementCard = null;
    }

    clickToCopy(e) {
        e.preventDefault();
        if (e.target.innerText[0] === '+') {
            this.copy(e.target.innerText.split('').filter(char => char != '-').join(''), 'Номер скопирован в буфер обмена');
        } else {
            this.copy(e.target.innerText, 'Адрес скопирован в буфер обмена');
        }        
    }
    copy(copied, msg) {
        const copyMessageElement = document.createElement('div');
        copyMessageElement.classList.add('copy-message');
        copyMessageElement.innerText = msg;
        document.body.append(copyMessageElement)

        const input = document.createElement('input');
        input.value = copied;
        copyMessageElement.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();

        setTimeout(()=>{ copyMessageElement.remove(); }, 1000)
    }
}