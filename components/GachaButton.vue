<script setup>
defineProps({
  startGacha: Function,
  isRolling: Boolean,
  isDisabled: Boolean
});
</script>

<template>
  <div class="btn-border-gradient-wrap btn-border-gradient-wrap--gold" :class="{ 'disabled': isRolling || isDisabled }">
    <a class="btn btn-border-gradient" @click.prevent="startGacha">
      <span class="btn-text-gradient--gold">ガチャを回す</span>
    </a>
  </div>
</template>

<style scoped>
.btn,
a.btn,
button.btn {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.5;
  position: relative;
  display: inline-block;
  padding: 1rem 4rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  color: #212529;
  border-radius: 0.5rem;
}

/* ボタンを無効化するスタイル */
.btn-border-gradient-wrap.disabled {
  pointer-events: none; /* クリックを無効化 */
  opacity: 0.5; /* 視覚的に無効化されていることを示す */
}

.btn-border-gradient-wrap--gold {
  background-image: -webkit-linear-gradient(
    315deg,
    #704308 0%,
    #ffce08 37%,
    #fefeb2 47%,
    #fafad6 50%,
    #fefeb2 53%,
    #e1ce08 63%,
    #704308 100%
  );
  background-image: linear-gradient(
    135deg,
    #704308 0%,
    #ffce08 37%,
    #fefeb2 47%,
    #fafad6 50%,
    #fefeb2 53%,
    #e1ce08 63%,
    #704308 100%
  );
}

.btn-border-gradient-wrap--gold:hover a.btn {
  text-shadow: 0 0 15px rgba(250, 250, 214, 0.5),
    0 0 15px rgba(250, 250, 214, 0.5), 0 0 15px rgba(250, 250, 214, 0.5),
    0 0 15px rgba(250, 250, 214, 0.5);
}

.btn-border-gradient-wrap {
  display: inline-block;

  padding: 0.2rem;

  border-radius: 0.5rem;
}

a.btn-border-gradient {
  font-size: 2rem;
  background: #000;
}

.btn-text-gradient--gold {
  font-family: "ヒラギノ明朝 Pro W3", "Hiragino Mincho Pro",
    "Hiragino Mincho ProN", "HGS明朝E", "ＭＳ Ｐ明朝", serif;

  background: -webkit-gradient(
    linear,
    left bottom,
    left top,
    from(#ffffdb),
    to(#a16422)
  );

  background: -webkit-linear-gradient(bottom, #ffffdb, #a16422);

  background: linear-gradient(to top, #ffffdb, #a16422);
  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;
}
</style>
