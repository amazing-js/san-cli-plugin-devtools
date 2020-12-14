function drag(el, onStart, onMove, onStop) {
    let x = 0;
    let y = 0;
    let l = 0;
    let t = 0;
    let isDown = false;

    function stop(e) {
        e.preventDefault();
        e.stopPropagation();
        // 开关关闭
        isDown = false;
        document.removeEventListener('mouseup', stop);
        document.removeEventListener('mousemove', move);
        typeof onStop === 'function' && onStop();
    }

    function move(e) {
        if (isDown === false) {
            return;
        }
        // 获取x和y
        let nx = e.clientX;
        let ny = e.clientY;
        // 计算移动后的左偏移量和顶部的偏移量
        let nl = nx - (x - l);
        let nt = ny - (y - t);

        typeof onMove === 'function' && onMove(nl, nt);
        x = nx;
        y = ny;
    }

    el.addEventListener('mousedown', (e) => {
        typeof onStart === 'function' && onStart();
        // 获取x坐标和y坐标
        x = e.clientX;
        y = e.clientY;

        // 开关打开
        isDown = true;
        // 鼠标移动
        document.addEventListener('mouseup', stop);
        document.addEventListener('mousemove', move);
    });
}

export default drag;
