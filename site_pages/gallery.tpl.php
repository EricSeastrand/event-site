<div class= 'event-gallery'>
<?php
$handle = opendir(dirname(__FILE__).'/../photos/');
while($file = readdir($handle)){
	if($file !== '.' && $file !== '..'){
		echo '<img src="photos/'.$file.'" border="0" />';
	}
}
?>
</div>

