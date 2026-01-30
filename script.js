"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const layout = document.querySelector(".layout");
    const listItems = Array.from(
        document.querySelectorAll(".project-listing li[data-project]")
    );
    if (!listItems.length) {
        return;
    }

    const itemToPanel = new Map();
    listItems.forEach((item) => {
        const projectId = item.dataset.project;
        const panel = document.querySelector(
            `.project-panel[data-project="${projectId}"]`
        );
        if (panel) {
            itemToPanel.set(item, panel);
        }
    });

    const activeItems = listItems.filter((item) => itemToPanel.has(item));
    if (!activeItems.length) {
        return;
    }

    document.documentElement.classList.add("js-enabled");

    const orderedItems = activeItems.slice();
    const hasCustomOrder = orderedItems.some(
        (item) => item.dataset.rotateIndex !== undefined
    );
    if (hasCustomOrder) {
        const domIndex = new Map(
            orderedItems.map((item, index) => [item, index])
        );
        orderedItems.sort((a, b) => {
            const aIndex = Number(a.dataset.rotateIndex);
            const bIndex = Number(b.dataset.rotateIndex);
            const aValid = Number.isFinite(aIndex);
            const bValid = Number.isFinite(bIndex);
            if (aValid && bValid) {
                return aIndex - bIndex;
            }
            if (aValid) {
                return -1;
            }
            if (bValid) {
                return 1;
            }
            return domIndex.get(a) - domIndex.get(b);
        });
    }

    const indexByItem = new Map(
        orderedItems.map((item, index) => [item, index])
    );

    let currentIndex = 0;
    let activeItem = null;
    let timerId = null;
    let isPaused = false;

    const setActive = (item) => {
        if (!item || item === activeItem) {
            return;
        }
        if (activeItem) {
            activeItem.classList.remove("is-active");
            itemToPanel.get(activeItem).classList.remove("is-active");
        }
        activeItem = item;
        activeItem.classList.add("is-active");
        itemToPanel.get(activeItem).classList.add("is-active");
    };

    const rotationIntervalMs = Number(layout?.dataset.rotationInterval) || 1000;

    const scheduleNext = () => {
        clearTimeout(timerId);
        timerId = window.setTimeout(() => {
            if (isPaused) {
                return;
            }
            currentIndex = (currentIndex + 1) % orderedItems.length;
            setActive(orderedItems[currentIndex]);
            scheduleNext();
        }, rotationIntervalMs);
    };

    const pause = () => {
        if (isPaused) {
            return;
        }
        isPaused = true;
        clearTimeout(timerId);
    };

    const resume = () => {
        if (!isPaused) {
            return;
        }
        isPaused = false;
        scheduleNext();
    };

    orderedItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            pause();
            const nextIndex = indexByItem.get(item) ?? 0;
            currentIndex = nextIndex;
            setActive(item);
        });

        item.addEventListener("mouseleave", () => {
            requestAnimationFrame(() => {
                if (!document.querySelector(".project-listing li:hover")) {
                    resume();
                }
            });
        });
    });

    setActive(orderedItems[0]);
    scheduleNext();
});
