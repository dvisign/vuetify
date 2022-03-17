<template>
  <transition name="modal">
    <div class="table-modal-mask">
      <div class="table-modal-wrapper">
        <div class="table-modal-container">

            <div class="table-modal-header">
                <slot name="header">default header</slot>
            </div>
            <div class="table-modal-body">
                <slot name="body">default body</slot>
            </div>

            <div class="table-modal-footer">
                <slot name="footer"> </slot>
            </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
.table-modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}
.table-modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.table-modal-container {
  width: fit-content;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}
.table-modal-header h3 {
  margin-top: 0;
}
.table-modal-body {
  margin-top: 0;
  color: #42b983;
}
.table-modal-default-button {
  float: right;
}
.table-modal-footer {
  margin: 20px 0;
  text-align: right;
}
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */
.table-modal-enter {
  opacity: 0;
}
.table-modal-leave-active {
  opacity: 0;
}
.table-modal-enter .table-modal-container,
.table-modal-leave-active .table-modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>