<?php
if($_REQUEST['action'])
	error_reporting(E_ALL);
else
	error_reporting(false);
	
require_once(dirname(__FILE__) . '/esDB/esDB.inc.php');
require_once(dirname(__FILE__) . '/esAPI/esAPI_DB.inc.php');
require_once(dirname(__FILE__) . '/Template.inc.php');

	//print_r( $_SERVER );

$api = new esAPI_DB();
$api->routeClass = new event_AJAX_Actions();
$api->loadConfig_JSON( dirname(__FILE__) . '/routes.json' );

$api->Listen();

/* The API would have responded and exited by now if this were an AJAX request.
*	Render the homepage instead.
**/

if(! @$_REQUEST['event'] )
	$_REQUEST['event'] = 1;
$eventInfo = $api->ExecRoute( 'Event_Get', array('eventId' => $_REQUEST['event']));

$renderer = new Template();

$eventInfo = @$eventInfo[0];
@renderStartEndTime($eventInfo);

$renderer->stash = $eventInfo;

$renderer->templateDirectory = dirname(__FILE__) . '/site_pages/';
if(! isset($_REQUEST['page']) )
	$_REQUEST['page'] = 'home';
$renderer->renderPage( $_REQUEST['page'] );

echo $renderer->renderedHTML;


function renderStartEndTime(&$templateData) {
	$startUnix = strtotime( $templateData['Event.Time_Start'] );
	$templateData['Event.Start.Date'] = strftime('%b %d %Y', $startUnix);
	$templateData['Event.Start.Time'] = strftime('%l %P', $startUnix);
	$templateData['Event.End.Time']   = strftime('%l %P', strtotime($templateData['Event.Time_End']) );
}

class event_AJAX_Actions {
	function Event_TimeSlot_SetAll( $api ) {
		$eventId = $_REQUEST['eventId'];
		$stageId = $_REQUEST['stageId'];
		$newTimeslots = json_decode($_REQUEST['timeslots'], true);
		
		$api->ExecRoute( 'Event_TimeSlot_DeleteAll', array('eventId' => $eventId, 'stageId' => $stageId) );
		
		foreach( $newTimeslots as $timeslot ) {
			$api->ExecRoute( 'Event_TimeSlot_Create', array(
				"performerId" => $timeslot['performerId'],
				"eventId"     => $eventId,
				"end"         => $timeslot['end'],
				"start"       => $timeslot['start'],
				"stageId"     => $timeslot['stageId']
			) );
		}
		
		return $api->ExecRoute( 'Event_TimeSlot_Get', array('eventId' => $eventId) );
	}
	
	function Performer_Create_WithNewPerson( $api ) {
		$details = array(
			'nameFirst'     => $_REQUEST['nameFirst'],
			'nameLast'      => $_REQUEST['nameLast'],
			'performerName' => $_REQUEST['performerName'],
			'facebookUrl'   => $_REQUEST['facebookUrl']
		);
		
		$newPersonId = $api->ExecRoute( 'Person_Create', $details );
		
		$details['personId'] = $newPersonId;
		
		$newPerformerId = $api->ExecRoute( 'Performer_Create', $details );
		
		return $newPerformerId;
	}
}
?>
