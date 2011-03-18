AddComboBox = Ext.extend(Ext.form.ComboBox
 ,{ onLoad : function () {
      if (!this.hasFocus) {
        return
      }
      if (this.store.getCount() > 0) {
        this.expand()
        this.restrictHeight()
        if (this.lastQuery == this.allQuery) {
          if (this.editable) {
            this.el.dom.select()
          }
          if ( this.typeAhead
            && this.lastKey != Ext.EventObject.BACKSPACE
            && this.lastKey != Ext.EventObject.DELETE) {
              this.taTask.delay(this.typeAheadDelay)
            }
        }
      }
      else {
        this.onEmptyResults()
      }
    }
  , onViewClick : function(doFocus) {
      var index = this.view.getSelectedIndexes()[0]
      var r = this.store.getAt(index)
      if (r) {
        this.onSelect(r, index)
      }
      else {
        this.collapse()
      }
      if(doFocus !== false) {
        this.el.focus()
      }
    }
  }
)
