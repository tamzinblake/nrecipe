var selectedRecord;
var editWindow;
var oper;
var storeLoaded = false;
var notNull = function (val) {
  return val ? val : '';
};

Ext.onReady(function(){
    var body = Ext.getBody();

    var Record = Ext.data.Record.create([
        {name: "id", mapping: 0},
        {name: "name", mapping: 1},
	{name: "create_date", mapping: 2}
    ]);

    var reader = new Ext.data.JsonReader(
	{
	    root: 'rows',
	    totalProperty: 'totalcount',
	    id: 'id'
	}, Record
    );

    var store = new Ext.data.Store({
	proxy: new Ext.data.HttpProxy({
	    api: {
		read: '/recipe/admin/lists/list'
	    },
	    method : 'post'
	}),
	reader: reader,
	remoteSort: true,
	listeners: {
	    exception: failure_store
	},
	sortInfo: {
	    field: 'item',
	    direction: 'ASC'
	}
    });

    var editWindow = listWindowFactory({
	getSelected: function(){
	    return selectedRecord;
	},
	loadStore:loadStore
    });
    var addButton = new Ext.Button({
	text: 'New list',
	listeners: {
	    click: function(){
		editWindow.openAdd();
	    }
	}
    });

    function doEdit() {
	if (selectedRecord) {
	    editWindow.openEdit();
	}
    };

    var editButton = new Ext.Button({
	text: 'Change name',
	disabled: true,
	listeners: {
	    click: doEdit
	}
    });

    var deleteButton = new Ext.Button({
	text: 'Delete',
	disabled: true
    });

    deleteButton.on('click', function(){
	if (selectedRecord) {
	    Ext.Ajax.request({
		url: '/recipe/admin/lists/delete',
		success: function(response,options){
		    if (success_ajax(response,options))
			loadStore();
		},
		failure: failure_ajax,
		params: { id: selectedRecord.data.id }
	    });
	}
	clearSelection();
    });

    var openButton = new Ext.Button({
	text: 'Edit list',
	disabled: true
    });

    var openList = function() {
	if (selectedRecord) {
	    window.location.href='/recipe/admin/lists/list-setup/'+selectedRecord.data.id;
	}
    };

    openButton.on('click', openList);

    function clearSelection() {
	if (grid) {
	    grid.getSelectionModel().clearSelections();
	    grid.getSelectionModel().fireEvent('rowdeselect');
	}
	selectedRecord          = null;
    }

    var pagingBar = new Ext.StatefulPagingToolbar ({
        store: store,
        pageSize: 50,
        emptyMsg: 'no data to display',
        displayInfo: true,
        prependButtons: true,
        stateId: 'paging_toolbarlists',
        stateful: true,
        stateEvents: ['change','select'],
        listeners: {
            staterestore:
            function(){
                store.setBaseParam('start',this.cursor);
                loadStore();
            },
            //handles selects from the filterCombo
            select: function(){
                this.cursor = 0;
            }
        },
	items: [
	    '<a href="/recipe/index.html">Back to menu</a>',
	    '-',
	    addButton,
	    '-',
	    editButton,
	    '-',
	    deleteButton,
	    '-',
	    openButton,
	    '-',
	    '->',
	    '-',
	    'List browser',
	    '-'
	]
    });

    function loadStore() {
	storeLoaded = false;
	store.load({
	    callback: function() {
		storeLoaded = true;
	    }
	});
    }

    function linkRendererFactory(path, name, extra) {
        extra = extra || '';
        return function(value, metaData, record, rowIndex, colIndex, store) {
            return '<a href="'+path+value+extra+'">'+name+'</a>';
        };
    }

    var model = new Ext.grid.ColumnModel({
	columns: [{
	    header   : 'Id',
	    width    : 36,
	    dataIndex: 'id',
	    sortable : true
	},{
	    header   : 'Name',
	    width    : 72,
	    dataIndex: 'name',
	    sortable : true
	},{
	    header   : 'Date',
	    width    : 72,
	    dataIndex: 'create_date',
	    sortable : true
	},{
	    header   : 'Export',
	    width    : 72,
            dataIndex: 'id',
            sortable : false,
            renderer : linkRendererFactory('/recipe/admin/lists/export/list', 'export', '.txt')
	}],
	defaults: {
	    renderer: 'htmlEncode'
	}
    });

     var gridSelectionModel = new Ext.grid.RowSelectionModel({
	singleSelect: true,
	listeners: {
	    rowdeselect: function (sm, rowIndex, r) {
		selectedRecord = null;
		deleteButton.disable();
		editButton.disable();
		openButton.disable();
	    },
	    rowselect: function (sm, rowIndex, r) {
		selectedRecord = r;
		if (selectedRecord) {
		    deleteButton.enable();
		    editButton.enable();
		    openButton.enable();
		}
	    }
	}
    });

    var grid = new Ext.grid.GridPanel({
	store: store,
	sm: gridSelectionModel,
	cm: model,
	region: 'center',
	stripeRows: true,
	enableHdMenu: false,
	tbar: pagingBar,
	enableColumnHide : false,
	stateful   : true,
	stateId    : "itemGridState",

	listeners: {
	    rowdblclick: openList
	},
	viewConfig: {
	    forceFit: true,
	    getRowClass: function(record, rowIndex, rp, ds){
		    return 'foo';
	    },
	    templates: {
		cell: new Ext.Template(
		    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '+
                        'x-selectable {css}" style="{style}" '+
                        'tabIndex="0" {cellAttr}>',
		    '<div class="x-grid3-cell-inner x-grid3-col-{id}" '+
                        '{attr}>{value}</div>',
		    '</td>'
		)
	    }
	}
    });
    loadStore();
    var viewport = new Ext.Viewport({
	layout: 'border',
	autoHeight: true,
	autoWidth: true,
	renderTo: body,
	items: [grid]
    });
    viewport.render();
});
