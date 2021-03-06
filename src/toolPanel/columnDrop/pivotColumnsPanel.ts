import {
    Utils,
    SvgFactory,
    Bean,
    Component,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    GridPanel,
    Logger,
    DropTarget,
    PostConstruct,
    Events,
    DraggingEvent,
    Column,
    DragSource
} from "ag-grid/main";
import {AbstractColumnDropPanel} from "./abstractColumnDropPanel";

var svgFactory = SvgFactory.getInstance();

@Bean('pivotColumnsPanel')
export class PivotColumnsPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    constructor(horizontal: boolean) {
        super(horizontal);
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to pivot');
        var title = localeTextFunc('pivots', 'Pivots');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            iconFactory: svgFactory.createPivotIcon,
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshGui.bind(this));
    }

    protected isColumnDroppable(column: Column): boolean {
        var columnPivotable = !column.getColDef().suppressPivot;
        var columnNotAlreadyPivoted = !this.columnController.isColumnPivoted(column);
        return columnPivotable && columnNotAlreadyPivoted;
    }

    protected removeColumns(columns: Column[]): void {
        var columnsPivoted = Utils.filter(columns, column => this.columnController.isColumnPivoted(column) );
        this.columnController.removePivotColumns(columnsPivoted);
    }

    protected addColumns(columns: Column[]) {
        this.columnController.addPivotColumns(columns);
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getPivotColumns();
    }

}