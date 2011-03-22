function unitWindowFactory(config){ with(config){
  Ext.QuickTips.init()

  var fieldSet = new Ext.form.FieldSet(
    { border: false
    , style: { marginTop: '10px'
             , marginBottom: '0px'
             , paddingBottom: '0px'
             }
    , layout: { type: 'form'
              , labelSeparator: ''
              }
    , defaults: { xtype: 'textfield'
                }
    , items:
       [ { id: '_id'
         , xtype: 'hidden'
         }
       , { id: 'name'
         , anchor: '100%'
         , fieldLabel: 'Name'
         }
       , { id: 'type'
         , anchor: '100%'
         , fieldLabel: 'Type'
         }
       , { id: 'conversion'
         , anchor: '100%'
         , fieldLabel: 'Conversion'
         }
       ]
    }
  )

  var closeButton = new Ext.Button(
    { text: 'Cancel'
    , handler: function () {
        editWindow.fireEvent('goFinished')
      }
    }
  )

  var editPanel = new Ext.form.FormPanel(
    { buttonAlign: 'center'
    , items: [ fieldSet
             ]
    , buttons:
      [ closeButton
      , { text: 'Submit'
        , handler: function () {
            editPanel.getForm().submit(
              { url: '/nrecipe/units/replace'
              , params: {}
              , failure: failureForm
              , success: function (form,action) {
                  if (editWindow.state =='editing') {
                    editWindow.fireEvent('goFinished')
                  }
                  else if (editWindow.state =='adding') {
                    editWindow.fireEvent('goAdding')
                  }
                }
              }
            )
          }
        }
      ]
    }
  )

  var editWindow = new Ext.Window(
    { width: 550
    , height: 200
    , title: 'Edit'
    , y: 25
    , manager: userWindowGroup
    , modal: true
    , layout: 'fit'
    , closeAction: 'hide'
    , items: editPanel
    , openAdd: function () {
        editWindow.fireEvent('goLoading','goAdding')
      }
    , openEdit: function () {
        editWindow.fireEvent('goLoading','goEditing')
      }
    }
  )

  editWindow.addEvents(
    { 'goAdding'  : true
    , 'goEditing' : true
    , 'goLoading' : true
    , 'goFinished': true
    }
  )

  editWindow.loaded = 0
  editWindow.addListener('goLoading', function (next) {
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
    loadStore()
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
    editPanel.getForm().loadRecord(getSelected())
  } )

  editWindow.addListener('goFinished', function () {
    editWindow.state = 'finished'
    editWindow.hide()
    loadStore()
  } )

  return editWindow
} }
