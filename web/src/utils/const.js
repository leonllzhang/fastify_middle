/**
 * @description 常量
 * @author Eason Dong
 */
/*export function EMPTY_FN()*/
export const component_status = "status";
//大文件上传过期时间配置
export const FILE_UPLOAD_EXPIRATION = "1:00:00";
/*export data error message*/
export const download_export_task_error_cn = ["task不存在","task状态不是已完成状态","task已过期","权限错误","下载失败","相同任务正在执行中，请查看导出任务明细。",'只能取消排队中的导出任务。',"导出成功，点击任务详情进行查看。","导出失败","下载失败","获取任务失败","取消失败"];
export const download_export_task_error_tw = ["task不存在","task狀態不是已完成狀態","task已過期","權限錯誤","下載失敗","相同任務正在執行中，請查看導出任務明細。",'只能取消排隊中的導出任務。',"導出成功，點擊任務詳情進行查看。","導出失敗","下載失敗","獲取任務失敗","取消失敗"];
export const download_export_task_error_en = ["The task does not exist","The task status is not completed","Task expired","Permission error","Download failed","The same task is being executed, please view task details. ","Only task waiting in the line can be cancelled.","Export succeed, click view task details button to see more.","Export failed","Download failed","Failed to get task","Cancel failed"];

//病毒扫描状态多语配置
export const FILE_LANGUAGE_PENDING = ['文件正在排队中，请耐心等候。可尝试刷新页面获取最新状态。', '文件正在排隊中，請耐心等候。可嘗試刷新頁面獲取最新狀態。', 'File is waiting to be processed, you may refresh the page to get updated status.']
export const FILE_LANGUAGE_SCANNING = ['文件正在病毒扫描中，请耐心等候 。可尝试刷新页面获取最新状态。','文件正在病毒掃描中，請耐心等候 。可嘗試刷新頁面獲取最新狀態。','File is being scanned, you may refresh the page to get updated status.']
export const FILE_LANGUAGE_INSECURITY = ['文件病毒扫描失败，请检查文件有效性。', '文件病毒掃描失敗，請檢查文件有效性。', 'File scan failed, please check the validity of the file.']
export const FILE_LANGUAGE_CONVERTING = ['文件正在转换中，请耐心等候。可尝试刷新页面获取最新状态。', '文件正在轉換中，請耐心等候。可嘗試刷新頁面獲取最新狀態。', 'File is converting to PDF, you may refresh the page to get updated status.']
export const FILE_LANGUAGE_CONVERTERROR = ['转换文件错误, 请检查文件有效性。', '轉換文件錯誤, 請檢查文件有效性。', 'Conversion error, please check the validity of the file.']
export const FILE_LANGUAGE_ERROR = ['文件扫描警报，检测到病毒。为了安全起见，请删除文件！', '文件掃描警報，檢測到病毒。為了安全起見，請刪除文件！', 'File scan alert, virus detected. Please remove the file(s) for safety!']

//设置GetCurrentUer接口请求时间（分钟）
export const LOCALSTORAGE_TIME = 15;