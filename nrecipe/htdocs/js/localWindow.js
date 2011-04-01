function localWindowFactory(config){
  Ext.QuickTips.init()

  var closeButton = new Ext.Button(
    { text: 'Cancel'
    , handler: function(){
        editWindow.fireEvent('goFinished')
      }
    }
  )

  var editPanel = new Ext.form.FormPanel(
    { buttonAlign: 'center'
    , region: 'center'
    , items: [ config.fieldSet
             ]
    , buttons: [ closeButton
               , { text: 'Submit'
                 , handler: function () {
                     var doc = (config.getSelected && config.getSelected())
                             ? (config.getSelected().data || {})
                             : {}
                     var values = editPanel.getForm().getValues()
                     Ext.apply(doc,values.ingredient)
                     doc.amount = values.amount
                     doc.unit = values.unit
                     for (p in doc) {
                       if (p.match(/^__/) || p == 'modified') {
                         delete doc[p]
                       }
                     }
                     var located = config.store.findBy(function (record, id) {
                       return record.data._id == doc.ingredient._id
                     })
                     if (located >= 0) {
                       Ext.apply(config.store.getAt(located).data, doc)
                     }
                     else {
                       config.store.addSorted(new config.Record(doc))
                     }
                     if (editWindow.state =='editing') {
                       editWindow.fireEvent('goFinished')
                     }
                     else if (editWindow.state =='adding') {
                       editWindow.fireEvent('goAdding')
                     }
                   }
                 }
               ]
    }
  )

  var editWindow = new Ext.Window(
    { width: config.width
    , height: config.height
    , title: 'Edit'
    , y: 50
    , manager: userWindowGroup
    , modal: true
    , layout: config.layout || 'fit'
    , closeAction: 'hide'
    , items: config.item ? [config.item, editPanel] : editPanel
    , openAdd: function () {
        editWindow.fireEvent('goLoading', 'goAdding')
      }
    , openEdit: function () {
        editWindow.fireEvent('goLoading', 'goEditing')
      }
    }
  )

  editWindow.addEvents( { 'goAdding'   : true
                        , 'goEditing'  : true
                        , 'goLoading'  : true
                        , 'goFinished' : true
                        }
                      )

  editWindow.loaded = 0
  editWindow.addListener('goLoading',function(next){
    if (editWindow.state == 'loading' && editWindow.loaded < 2){
      editWindow.loaded++
    }
    else if (editWindow.state != 'loading') {
      editWindow.state = 'loading'
      editWindow.loaded = 0
      editWindow.fireEvent('goLoading',next)
      editWindow.fireEvent('goLoading',next)
      editWindow.fireEvent('goLoading',next)
    }
    else {
      editWindow.fireEvent(next)
    }
  } )

  editWindow.addListener('goAdding', function () {
    editWindow.show()
    editPanel.getForm().reset()
    config.loadStore()
    editWindow.state = 'adding'
    closeButton.setText('Close')
    editWindow.setTitle('Add')
    editPanel.items._id=null
  } )

  editWindow.addListener('goEditing', function () {
    editWindow.show()
    editWindow.state = 'editing'
    closeButton.setText('Cancel')
    editWindow.setTitle('Edit')
    config.loadForm(editPanel.getForm(), config.getSelected())
  } )

  editWindow.addListener('goFinished', function () {
    editWindow.state = 'finished'
    editWindow.hide()
    config.loadStore()
  } )

  return editWindow
}
