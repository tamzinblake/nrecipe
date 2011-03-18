function recipeWindowFactory (config) { with (config) {
  Ext.QuickTips.init()

  var comboRecord = new Ext.data.Record.create(
    [ {name: 'description', mapping: 0}
    ]
  )

  var unitReader = new Ext.data.JsonReader(
    { totalProperty: 'totalcount'
    , root: 'rows'
    }
  , comboRecord
  )

  var unitStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { url: '/recipe/admin/units/list'
        , method : 'post'
        }
      )
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failure_store
                 }
    , reader: unitReader
    }
  )

  var unitCombo = new AddComboBox(
    { store: unitStore
    , displayField: 'description'
    , valueField: 'description'
    , hiddenName: 'unit'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'unit_id'
    , fieldLabel: 'Default units'
    }
  )

  var field_set = new Ext.form.FieldSet(
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
        [ { id: 'id'
          , xtype: 'hidden'
          }
        , { id: 'name'
          , anchor: '100%'
          , fieldLabel: 'Name'
          }
        ]
    }
  )

  closeButton = new Ext.Button(
    { text: 'Cancel'
    , handler: function () {
        editWindow.fireEvent('go_finished')
      }
    }
  )

  var editPanel = new Ext.form.FormPanel(
    { buttonAlign: 'center'
    , items: [ field_set
             ]
    , buttons:
        [ closeButton
        , { text: 'Submit'
          , handler: function(){
              editPanel.getForm().submit(
                { url: '/recipe/admin/recipes/replace'
                , params: {}
                , failure: failure_form
                , success: function(form,action) {
                    if (editWindow.state =='editing') {
                      editWindow.fireEvent('go_finished')
                    }
                    else if (editWindow.state =='adding') {
                      editWindow.fireEvent('go_adding')
                    }
                  }
                }
              )
            }
          }
        ]
    }
  )

  editWindow = new Ext.Window(
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
        editWindow.fireEvent('go_loading','go_adding')
      }
    , openEdit: function () {
        editWindow.fireEvent('go_loading','go_editing')
      }
    }
  )

  editWindow.addEvents(
    { 'go_adding'  : true
    , 'go_editing' : true
    , 'go_loading' : true
    , 'go_finished': true
    }
  )

  editWindow.loaded = 0
  editWindow.addListener('go_loading', function (next) {
    if (editWindow.state == 'loading' && editWindow.loaded < 2) {
      editWindow.loaded++
    }
    else if (editWindow.state != 'loading') {
      editWindow.state = 'loading'
      editWindow.loaded = 0
      editWindow.fireEvent('go_loading',next)
      editWindow.fireEvent('go_loading',next)
      editWindow.fireEvent('go_loading',next)
    }
    else {
      editWindow.fireEvent(next)
    }
  } )

  editWindow.addListener('go_adding', function () {
    editWindow.show()
    editPanel.getForm().reset()
    loadStore()
    editWindow.state = 'adding'
    closeButton.setText('Close')
    editWindow.setTitle('Add')
    editPanel.items.id=null
  } )

  editWindow.addListener('go_editing', function () {
    editWindow.show()
    editWindow.state = 'editing'
    closeButton.setText('Cancel')
    editWindow.setTitle('Edit')
    editPanel.getForm().loadRecord(getSelected())
  } )

  editWindow.addListener('go_finished', function () {
    editWindow.state = 'finished'
    editWindow.hide()
    loadStore()
  } )

  return editWindow
} }
