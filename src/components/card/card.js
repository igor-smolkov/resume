import './card.scss'

export default class Card {
    constructor(element, zone) {
        this.elementCard = element;
        this.elementCardFrontside = this.elementCard.querySelector('.card__frontside');
        this.elementCardBackside = this.elementCard.querySelector('.card__backside');

        this.elementCardZone = zone;

        this.dragging = {
            cardElem: null,
            cursorShift: {x: null, y: null},
            isEnterZone: false,
        }

        this.isFlipping = false;

        this.elementCardFrontside.querySelectorAll('a[href="copy/"').forEach(elementContactToCopy => {
            elementContactToCopy.addEventListener('click', (e)=>{this.clickToCopy(e)});
        });
        
        this.elementCard.addEventListener('pointerdown', (e)=>{this.onCardPointerDown(e)});
        this.elementCard.addEventListener('pointerup', this.onCardPointerUp.bind(this));

        document.addEventListener('pointermove', (e)=>{this.onDocPointerMove(e)});
        document.addEventListener('pointerup', this.onDocPointerUp.bind(this));

        this.elementCard.addEventListener('dragstart', (e)=>{this.onCardDragStart(e)});

        this.elementCardZone.addEventListener('dragenter', this.onCardZoneDragEnter.bind(this));
        this.elementCardZone.addEventListener('dragleave', this.onCardZoneDragLeave.bind(this));
        this.elementCardZone.addEventListener('dragover', (e)=>{this.onCardZoneDragOver(e)});
        this.elementCardZone.addEventListener('drop', (e)=>{this.onCardZoneDrop(e)});

        document.addEventListener('dragover', (e)=>{this.onDocDragOver(e)}, true);
        document.addEventListener('drop', (e)=>{this.onDocDrop(e)}, true);
    }
    onCardPointerDown(e) {
        this.animationAllRemove();
        if (e.target.classList.contains('drag-field')) {
            this.dragReady(e.target);
        }
        if (e.target.classList.contains('flip-field') && !e.target.classList.contains('drag-field')) {
            this.flipStart(e.target);
        }
    }
    onCardPointerUp() {
        this.flipBack();
    }
    onDocPointerMove(e) {
        this.flipEnd(e);
    }
    onDocPointerUp() {
        this.flipCancel();
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

    animationAllRemove() {
        this.elementCard.classList.remove('card_animation_rotate-left');
        this.elementCard.classList.remove('card_animation_rotate-right');
        this.resetCardAnimationOpacity();
        this.resetCardAnimationScale();
    }
    setCardDraggable() {
        this.elementCard.setAttribute('draggable', true);
    }
    resetCardDraggable() {
        this.elementCard.setAttribute('draggable', false);
    }
    setCardDragged() {
        this.elementCard.classList.add('card_dragged');
    }
    resetCardDragged() {
        this.elementCard.classList.remove('card_dragged');
    }
    setCardZoneAimed() {
        this.elementCardZone.classList.add('card-zone_aimed');
    }
    resetCardZoneAimed() {
        this.elementCardZone.classList.remove('card-zone_aimed');
    }
    setCardNone() {
        this.elementCard.classList.add('card_none');
    }
    resetCardNone() {
        this.elementCard.classList.remove('card_none');
    }
    setCardZoneAbandoned() {
        this.elementCardZone.classList.add('card-zone_abandoned');
    }
    resetCardZoneAbandoned() {
        this.elementCardZone.classList.remove('card-zone_abandoned');
    }
    setCardAnimationOpacity() {
        this.elementCard.classList.add('card_animation_opacity');
    }
    resetCardAnimationOpacity() {
        this.elementCard.classList.remove('card_animation_opacity');
    }
    setCardAnimationScale() {
        this.elementCard.classList.add('card_animation_scale');
    }
    resetCardAnimationScale() {
        this.elementCard.classList.remove('card_animation_scale');
    }
    toggleFrontAndBacksideNone() {
        this.elementCardFrontside.classList.toggle('card__frontside_none');
        this.elementCardBackside.classList.toggle('card__backside_none');
    }

    //Drag&Drop
    dragReady() {
        if (this.dragging.cardElem === null) {
            this.dragging.cardElem = this.elementCard;
            this.setCardDraggable();
        }
    }
    onCardDragStart(e) {
        if (this.dragging.cardElem === null) return;
        this.dragging.isEnterZone = false;
        this.dragging.cursorShift.x = e.clientX - this.dragging.cardElem.offsetLeft;
        this.dragging.cursorShift.y = e.clientY - this.dragging.cardElem.offsetTop;
    }
    onCardZoneDragEnter() {
        if (this.dragging.cardElem === null) return;
        this.dragging.isEnterZone = true;
        this.setCardZoneAimed();
    }
    onCardZoneDragLeave() {
        if (this.dragging.cardElem === null) return;
        this.dragging.isEnterZone = false;
        this.resetCardZoneAimed();
    }
    onCardZoneDragOver(e) {
        this.dragOver(e, true)
    }
    onDocDragOver(e) {
        this.dragOver(e, false)
    }
    dragOver(e, zone) {
        if (this.dragging.cardElem === null) return;
        e.preventDefault();
        window.getSelection().removeAllRanges();
        if (zone) {
            this.dragging.isEnterZone = true;
            this.setCardZoneAimed();
        } else {
            this.setCardNone();
            this.setCardZoneAbandoned();
        }
    }
    onCardZoneDrop(e) {
        this.dragging.isEnterZone = true;
        this.drop(e)      
    }
    onDocDrop(e) {
        this.drop(e)
    }
    drop(e) {
        if (this.dragging.cardElem === null) return;
        this.resetCardNone();
        this.setCardAnimationOpacity();
        if (!this.dragging.isEnterZone) {
            this.setCardDragged();
            this.dragging.cardElem.style.left = e.clientX - this.dragging.cursorShift.x + 'px';
            this.dragging.cardElem.style.top = e.clientY - this.dragging.cursorShift.y + 'px';
        } else {
            this.dragging.cardElem.style.left = '0';
            this.dragging.cardElem.style.top = '0';
            this.resetCardDragged();
            this.resetCardZoneAbandoned();
        }
        this.resetCardDraggable();
        this.resetCardZoneAimed();
        this.dragging.cardElem = null;
    }

    //Card flip
    flipStart() {
        this.toggleFrontAndBacksideNone();
        this.isFlipping = true;
    }
    flipEnd(e) {
        if (this.isFlipping && (!e.target.classList.contains('flip-field') || e.pointerType !== 'mouse')) {
            this.setCardAnimationScale();
            this.flipCancel();
        }
    }
    flipBack() {
        if (this.isFlipping) {
            this.toggleFrontAndBacksideNone();
            this.flipCancel();
        }
    }
    flipCancel() {
        this.isFlipping = false;
    }
}