export default {
    headShake: <PropertyIndexedKeyframes>{
        transform: [
            'translateX(0)',
            'translateX(-3px) rotateY(-4.5deg)',
            'translateX(2.5px) rotateY(3.5deg)',
            'translateX(-1.5px) rotateY(-2.5deg)',
            'translateX(1px) rotateY(1.5deg)',
            'translateX(0)'
        ],
        offset: [0, 0.065, 0.185, 0.315, 0.435, 0.5],
        easing: ['ease-in-out']
    }
}
