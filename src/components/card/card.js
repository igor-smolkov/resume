import './card.scss'

export default class Card {
    constructor(element) {
        this.elementCard = element;
        this.elementCardFrontside = this.elementCard.querySelector('.card__frontside');
        this.elementCardBackside = this.elementCard.querySelector('.card__backside');

        this.draggingElementCard = null;
        this.isFlipping = false;

        this.elementCardFrontside.querySelectorAll('a[href="copy/"').forEach(elementContactToCopy => {
            elementContactToCopy.addEventListener('click', (e)=>{this.clickToCopy(e)});
        });
        
        this.elementCard.addEventListener('pointerdown', (e)=>{this.onCardPointerDown(e)});
        this.elementCard.addEventListener('pointerup', (e)=>{this.onCardPointerUp(e)});

        document.addEventListener('pointermove', (e)=>{this.onDocPointerMove(e)});
        document.addEventListener('pointerup', (e)=>{this.onDocPointerUp(e)});
    }
    onCardPointerDown(e) {
        if (e.target.classList.contains('drag-field')) {
            this.draggingElementCard = e.target.closest('.card');
            if (this.draggingElementCard !== null) {
                this.draggingElementCard.dataset.shiftX = e.clientX - this.draggingElementCard.getBoundingClientRect().left +34;
                this.draggingElementCard.dataset.shiftY = e.clientY - this.draggingElementCard.getBoundingClientRect().top +30;
                this.draggingElementCard.classList.add('card_dragged');
                this.draggingElementCard.style.zIndex += 2;
                document.body.classList.add('grabbing');
                this.draggingElementCard.style.left = e.pageX - this.draggingElementCard.dataset.shiftX-6 + 'px';
                this.draggingElementCard.style.top = e.pageY - this.draggingElementCard.dataset.shiftY-10 + 'px';
                window.getSelection().removeAllRanges();
            }
        } else if (e.target.classList.contains('flip-field')) {
            this.elementCardFrontside.classList.remove('card__frontside_animation_rotate');
            this.elementCardBackside.classList.remove('card__backside_animation_rotate');
            this.elementCardFrontside.classList.remove('card__frontside_animation_scale');
            this.elementCardBackside.classList.remove('card__backside_animation_scale');
            this.elementCardFrontside.classList.toggle('card__frontside_none');
            this.elementCardBackside.classList.toggle('card__backside_none');
            this.isFlipping = true;
        }
    }
    onCardPointerUp(e) {
        if (this.isFlipping) {
            this.elementCardFrontside.classList.toggle('card__frontside_none');
            this.elementCardBackside.classList.toggle('card__backside_none');
            this.isFlipping = false;
        }
    }
    onDocPointerMove(e) {
        if (this.draggingElementCard !== null) {
            this.draggingElementCard.style.left = e.pageX - this.draggingElementCard.dataset.shiftX + 'px';
            this.draggingElementCard.style.top = e.pageY - this.draggingElementCard.dataset.shiftY + 'px';
            window.getSelection().removeAllRanges();
        }
        if (this.isFlipping && (!e.target.classList.contains('flip-field') || e.pointerType !== 'mouse')) {
            this.elementCardFrontside.classList.add('card__frontside_animation_scale');
            this.elementCardBackside.classList.add('card__backside_animation_scale');
            this.isFlipping = false;
        }
    }
    onDocPointerUp(e) {
        this.draggingElementCard = null;
        document.body.classList.remove('grabbing');
        this.isFlipping = false;
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